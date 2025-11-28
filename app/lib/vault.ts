import vault from 'node-vault';
import fs from 'fs';

// Configuration from Environment Variables
const VAULT_URI = process.env.VAULT_URI || 'http://127.0.0.1:8200';
const VAULT_ROLE = process.env.VAULT_ROLE;
const VAULT_AUTH_METHOD = process.env.VAULT_AUTHENTICATION || 'TOKEN'; // 'KUBERNETES' or 'TOKEN'
const K8S_MOUNT_POINT = process.env.VAULT_KUBERNETES_PATH || 'kubernetes';
const K8S_TOKEN_PATH = process.env.VAULT_SERVICE_ACCOUNT_TOKEN_FILE || '/var/run/secrets/kubernetes.io/serviceaccount/token';

// Initialize Vault Client
const client = vault({
  apiVersion: 'v1',
  endpoint: VAULT_URI,
  // If using local dev with root token, use it. Otherwise, leave undefined for login.
  token: VAULT_AUTH_METHOD === 'TOKEN' ? process.env.VAULT_TOKEN : undefined
});

async function loginToVault() {
  if (VAULT_AUTH_METHOD !== 'KUBERNETES') return;

  try {
    console.log(`🔐 Attempting Vault Login via Kubernetes (Role: ${VAULT_ROLE})...`);
    
    // 1. Read the Pod's Service Account Token from disk
    if (!fs.existsSync(K8S_TOKEN_PATH)) {
      throw new Error(`K8s Token file not found at: ${K8S_TOKEN_PATH}`);
    }
    const jwt = fs.readFileSync(K8S_TOKEN_PATH, 'utf8').trim();

    // 2. Login to Vault using the K8s Auth Method
    // ⚠️ FIXED: Added (client as any) to bypass missing type definition
    const result = await (client as any).login(K8S_MOUNT_POINT, {
      role: VAULT_ROLE,
      jwt: jwt
    });

    // 3. Set the resulting Vault token for future requests
    client.token = result.auth.client_token;
    console.log("✅ Vault Login Successful!");
  } catch (error) {
    console.error("❌ Vault Kubernetes Login Failed:", error);
    throw error; // Critical failure
  }
}

export async function getSecret(path: string, key: string) {
  try {
    // Ensure we are logged in
    if (!client.token) await loginToVault();

    // Read the secret
    const result = await client.read(path);
    
    if (result?.data?.data) return result.data.data[key]; // KV V2
    if (result?.data) return result.data[key]; // KV V1
    
    return null;
  } catch (error) {
    console.error(`Vault Read Error (${path}):`, error);
    return process.env[key]; // Fallback to ENV
  }
}