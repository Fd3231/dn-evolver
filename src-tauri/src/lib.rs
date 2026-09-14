use std::{collections::HashMap, collections::BTreeMap, io::Write};
use std::process::Command as StdCommand;
use tauri_plugin_shell::process::Command;
use serde::Deserialize;
use tempfile::NamedTempFile;
use serde_json::{Value, json, to_string, to_string_pretty};
use tauri::Manager;
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::Output;

#[derive(Deserialize, Debug)]
struct Substation {
    id: String,
    #[serde(rename = "type")]
    item_type: String,
}

#[derive(Deserialize, Debug)]
struct Line {
    source: String,
    target: String,
    status: String,
    #[serde(rename = "type")]
    item_type: String,
}

#[derive(Deserialize, Debug)]
struct Instance {
    substations: Vec<Substation>,
    start_lines: Vec<Line>,
    target_lines: Vec<Line>
}

#[derive(Deserialize, Debug)]
struct Action {
    name: String,
    params: Vec<String>
}

#[derive(Deserialize, Debug)]
struct Step {
    id: i32,
    actions: Vec<Action>
}

#[derive(Deserialize, Debug)]
struct InputPayload {
    instance: Instance,
    plan: BTreeMap<i32, Step>,
}

#[tauri::command]
async fn run_validator(app: tauri::AppHandle, payload: InputPayload) -> Result<serde_json::Value, String> {
    //println!("Frontend JSON 1: {:#?}", payload.instance);
    //println!("Frontend JSON 2: {:#?}", payload.plan);

    validate_instance(&payload.instance)?;
    validate_plan(&payload.plan)?;

    let json_string = match process_instance(&payload.instance) {
        Ok(json_string) => json_string,
        Err(e) => return Err(format!("Failed to process instance: {}", e)),
    };
    let mut tmp_file = NamedTempFile::new().expect("Failed to create temp file");
    write!(tmp_file, "{}", json_string).expect("Failed to write to temp file");
    let tmp_instance_path = tmp_file.path().to_str().unwrap().to_string();
    //println!("Temp file path: {}", tmp_instance_path.display());

    let lines = process_plan(&payload.plan);
    /*for line in &lines {
        println!("{}", line);
    }*/
    let mut tmp_file = NamedTempFile::new().expect("Failed to create temp file");
    let content = lines.join("\n");
    write!(tmp_file.as_file_mut(), "{}", content).expect("Failed to write to temp file");
    let tmp_plan_path = tmp_file.path().to_str().unwrap().to_string();
    //println!("Temp file path: {}", tmp_plan_path.display());
    
    let output: Output = app.shell()
        .sidecar("validator")
        .unwrap()
        .args([tmp_instance_path.as_str(), tmp_plan_path.as_str(), "/", "--test-edge"])
        .output()
        .await
        .expect("Failed to run sidecar");

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    //println!("stdout:\n{}", stdout);
    //println!("stderr:\n{}", stderr);
    
    match output.status.code() {
        Some(0) => serde_json::from_str(&stdout).map_err(|e| e.to_string()),
        Some(1) => Err("Validation failed".to_string()),
        _ => Err("Validation failed".to_string()),
    }
}

fn validate_instance(instance: &Instance) -> Result<(), String> {
    if instance.substations.is_empty() {
        return Err("Instance has no substations".to_string());
    }
    if instance.start_lines.is_empty() {
        return Err("Instance has no start lines".to_string());
    }
    if instance.target_lines.is_empty() {
        return Err("Instance has no target lines".to_string());
    }
    Ok(())
}

fn validate_plan(plan: &BTreeMap<i32, Step>) -> Result<(), String> {
    if plan.is_empty() || plan.keys().all(|&key| key == 0) {
        return Err("Plan is empty".to_string());
    }
    if plan.iter().any(|(&key, step)| key != 0 && step.actions.is_empty()) {
        return Err("Plan contains steps with no actions".to_string());
    }
    Ok(())
}

fn process_instance(instance: &Instance) -> Result<String, String> {
    let mut v: Vec<String> = Vec::new();
    let mut tp: HashMap<String, &str> = HashMap::new();
    let mut e: Vec<String> = Vec::new();
    let mut e_star: Vec<String> = Vec::new();
    let mut sigma: HashMap<String, bool> = HashMap::new();
    let mut sigma_star: HashMap<String, bool> = HashMap::new();
    let mut buildable: Vec<String> = Vec::new();
    let mut removable: Vec<String> = Vec::new();
    let mut degrees: HashMap<String, i32> = HashMap::new();

    for substation in &instance.substations {
        let id = substation.id.to_uppercase();
        tp.insert(id.clone(), if substation.item_type == "primary" { "P" } else { "S" });
        degrees.insert(id.clone(), 0);
        v.push(id);
    }

    for line in &instance.start_lines {
        let l = format!("{}-{}", line.source.to_uppercase(), line.target.to_uppercase());

        match line.item_type.as_str() {
            "buildable" => buildable.push(l),
            "removable" => {
                sigma.insert(l.clone(), line.status == "closed");
                e.push(l.clone());
                removable.push(l);
            }
            _ => {
                sigma.insert(l.clone(), line.status == "closed");
                e.push(l);
            }
        }
    }

    for line in &instance.target_lines {
        let l = format!("{}-{}", line.source.to_uppercase(), line.target.to_uppercase());
        sigma_star.insert(l.clone(), line.status != "open");
        e_star.push(l);
    }

    let full: HashMap<&str, bool> = degrees
        .iter()
        .map(|(node, &deg)| (node.as_str(), deg == 3))
        .collect();

    let data = json!({
        "V": v,
        "TYPE": tp,
        "E": e,
        "Estar": e_star,
        "sigma": sigma,
        "full": full,
        "sigmaStar": sigma_star,
        "BUILDABLE": buildable,
        "REMOVABLE": removable,
    });

    serde_json::to_string_pretty(&data).map_err(|e| e.to_string())
}

fn process_plan(plan: &BTreeMap<i32, Step>) -> Vec<String> {
    let mut lines: Vec<String> = Vec::new();

    for (key, step) in plan {
        if *key == 0 {
            continue;
        }

        lines.push(key.to_string());

        for action in &step.actions {
            let params = action.params.join(" ");
            lines.push(format!("{} {}", format_action_name(&action), params));
        }
    }

    lines
}

fn format_action_name(action: &Action) -> String {
    let has_p = action.params.iter().any(|p| p.contains('p'));
    match action.name.as_str() {
        "add" => if has_p { "insp".to_string() } else { "inss".to_string() },
        "remove" => if has_p { "delp".to_string() } else { "dels".to_string() },
        "switch" => "sw".to_string(),
        _ => action.name.clone(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![run_validator])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
