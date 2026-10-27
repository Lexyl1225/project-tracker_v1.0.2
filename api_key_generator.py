import secrets
import os

def generate_api_key():
    """Generate key like: sk_live_<token_urlsafe(32)>"""
    return "sk_live_" + secrets.token_urlsafe(32)

def save_to_env(key_name, key_value, env_file=".env"):
    """Create or update .env file in the current directory."""
    env_data = {}

    # Load existing .env if present
    if os.path.exists(env_file):
        with open(env_file, "r") as f:
            for line in f:
                if "=" in line:
                    k, v = line.strip().split("=", 1)
                    env_data[k] = v

    # Insert/update key
    env_data[key_name] = key_value

    # Write back
    with open(env_file, "w") as f:
        for k, v in env_data.items():
            f.write(f"{k}={v}\n")

    print(f"Saved {key_name} to {env_file}")

if __name__ == "__main__":
    key_name = "API_KEY"  # change if needed
    api_key = generate_api_key()
    save_to_env(key_name, api_key)
    print(f"Generated API key: {api_key}")
