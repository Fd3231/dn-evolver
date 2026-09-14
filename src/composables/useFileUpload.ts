import { ref } from "vue";
import { useNetworkStore } from "../stores/useNetworkStore";
import { mapRecord, readFileAsText } from "../utils/utils";
import { Substation } from "../models/Substation";
import { Line } from "../models/Line";
import { InstanceSchema } from "../schemas/instance.schema";
import { ZodError } from "zod";
import { PlanSchema } from "../schemas/plan.schema";
import { useToast } from "./useToast";
import { Step } from "../models/Step";
import { usePlanStore } from "../stores/usePlanStore";
import { useValidationStore } from "../stores/useValidationStore";

export function useFileUpload() {
    const instanceFile = ref<File | null>(null);
    const planFile = ref<File | null>(null); 
    const instanceFileInput = ref<HTMLInputElement | null>(null);
    const planFileInput = ref<HTMLInputElement | null>(null);
    const errors = ref<{ instance: string | null; plan: string | null }>({
        instance: null,
        plan: null,
    });
    const { showToast } = useToast();
    const networkStore = useNetworkStore();
    const planStore = usePlanStore();
    const validationStore = useValidationStore();
    
    const handleFileChange = (fileType: "instance" | "plan", event: Event) => {
        const target = event.target as HTMLInputElement;        
        errors.value[fileType] = null;

        if (!target.files || target.files.length === 0) return;

        const file = target.files[0];

        if (!file.name.endsWith(".json") && file.type !== "application/json") {
            errors.value[fileType] = "Please upload a valid JSON file";
            target.value = "";
            return;
        }

        if (fileType === "instance") {
            instanceFile.value = file;
            uploadInstance();
        } else if (fileType === "plan") {
            planFile.value = file;
            uploadPlan();
        }
        target.value = "";
    };

    const openFile = (fileType: 'instance' | 'plan') => {
        if (fileType === 'instance') instanceFileInput.value?.click()
        else planFileInput.value?.click()
    }

    const uploadInstance = () => {
        _uploadInstance();
    };
    
    const _uploadInstance = (validate = validateInstance, update = initializeNetwork) => {
        if (!instanceFile.value) return;

        return readFileAsText(instanceFile.value)
        .then((text) => {
            let data = JSON.parse(text);
            validate(data);
            return data;
        }).catch((error: unknown) => {
            let err = parseUploadError(error);
            errors.value["instance"] = err;
            showToast(err, 'danger', "bottom-center");
        })
        .then((data) => {
            if (data) {
                update(data);
            }
        })
    };

    const initializeNetwork = (data: any) => {
        const substations = mapRecord(data.substations, Substation.fromJSON, (substation) => substation.id);
        const start_lines = mapRecord(data.start_lines, Line.fromJSON, (line) => line.id);
        const target_lines = mapRecord(data.target_lines, Line.fromJSON, (line) => line.id);
        networkStore.initializeNetwork(substations, start_lines, target_lines);
        validationStore.loadInstanceData(data);
        resetPlan();
    }

    const resetPlan = () => {
        planStore.resetPlan();
        planFile.value = null;
        if (planFileInput.value) {
            planFileInput.value.value = '';
        }
    }
    
    const uploadPlan = () => {
        _uploadPlan();
    };

    const _uploadPlan = (validate = validatePlan) => {
        if (!planFile.value) return;

        readFileAsText(planFile.value)
        .then((text) => {
            let data = JSON.parse(text);
            validate(data);
            return data;
        }).catch((error: unknown) => {
            let err = parseUploadError(error);
            errors.value["plan"] = err;
            showToast(err, 'danger', "bottom-center");
        })
        .then((data) => {
            if (data) {
                initializePlan(data);
            }
        })
    };

    const initializePlan = (data: any) => {
        const stepsData = Object.fromEntries(
            Object.entries(data).map(([key, val]) => [key, { id: Number(key), actions: val }])
        );
        const steps = mapRecord(stepsData, Step.fromJSON, (step) => step.id.toString());
        planStore.resetPlan();
        planStore.initializePlan(steps, networkStore.startLines);
    }

    const parseUploadError = (error: unknown): string => {
        if (error instanceof SyntaxError) return "Invalid JSON file";
        if (error instanceof ZodError) return error.issues[0].message;
        return "Failed to read file";
    };

    const validatePlan = (data: any): void => {
       PlanSchema.parse(data);
    }

    const validateInstance = (data: any): void => {
        InstanceSchema.parse(data);
    }

    return { instanceFile, planFile, errors, planFileInput, instanceFileInput, handleFileChange, validateInstance, initializeNetwork, openFile };
}