import json
import argparse
import sys
import os

def load_config(path):
    with open(path, "r") as f:
        return json.load(f)

def prompt_user(config, only_required=False):
    description = config.get("description", "")
    default = config.get("defaultValue")
    is_required = config.get("isRequired", False)

    if is_required or default is None:
        prompt = f"{description} \n(required): " if description else f"{config['name']} (required): "
        value = input(prompt).strip()
        while not value:
            print("This field is required.")
            value = input(prompt).strip()
        return value
    elif not only_required:
        prompt = f"{description} (press Enter to use default: {default}): " if description else f"{config['name']} (default {default}): "
        value = input(prompt).strip()
        return value if value else default
    else:
        return default

def generate_env(environment, prompt_only_required=False):
    name = environment.get("name", "default")
    filename = environment.get("filename", f".env.{name}")
    configs = environment.get("configs", [])

    lines = []
    print(f"\n🔧 Generating environment: {name} -> {filename}")

    for config in configs:
        key = config["name"]
        value = prompt_user(config, prompt_only_required)
        if " " in value:
            lines.append(f'{key}="{value}"')
        else:
            lines.append(f"{key}={value}")

    os.makedirs(os.path.dirname(filename), exist_ok=True) if os.path.dirname(filename) else None
    with open(filename, "w") as f:
        f.write("\n".join(lines))
        f.write("\n")

    print(f"✅ .env file created: {filename}")

def main():
    parser = argparse.ArgumentParser(description="Generate one or more .env files from JSON config.")
    parser.add_argument("--input", help="Path to the input JSON file.")
    parser.add_argument("--env", action="append", help="Environment name to generate (can be specified multiple times). If not provided, all environments are generated.")
    parser.add_argument("--prompt-only-required", action="store_true", help="Only prompt for required fields, use defaults for optional fields.")
    args = parser.parse_args()

    try:
        config_data = load_config(args.input)
    except FileNotFoundError:
        print(f"Error: File {args.input} not found.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        sys.exit(1)

    environments = config_data.get("environments", [])
    if not environments:
        print("No environments found in the input file.")
        sys.exit(1)

    # Filter environments if --env is provided
    selected_envs = environments
    if args.env:
        selected_envs = []
        requested_env_names = set(name.lower() for name in args.env)
        for env in environments:
            if env["name"].lower() in requested_env_names:
                selected_envs.append(env)

        missing_envs = requested_env_names - set(env["name"].lower() for env in selected_envs)
        if missing_envs:
            print(f"Error: Environments not found: {', '.join(missing_envs)}")
            sys.exit(1)

    # Generate selected environments
    for env in selected_envs:
        generate_env(env, args.prompt_only_required)

if __name__ == "__main__":
    main()
