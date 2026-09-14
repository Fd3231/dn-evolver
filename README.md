# Distribution Network Evolver

Interactive environment for investigating long-term distribution network transition plans.


## Installation
1. Install Rust and the platform build tools required by Tauri (https://v2.tauri.app/start/prerequisites/)
2. Install [bun](https://bun.com/docs/installation)
3. Run `bun install` in the root of the repository

## Usage

Prepare two input files:
- Distribution network specification (see `\example\network.json`)
- Transition plan (see `\example\plan.json`)

Then run:
```
    bun tauri dev
```
