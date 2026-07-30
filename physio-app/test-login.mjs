const supabaseUrl = 'https://ddsrgwmlzjkswxyzkqxd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkc3Jnd21semprc3d4eXprcXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNTI2ODgsImV4cCI6MjEwMDgyODY4OH0.Mcp7Zpv1_zIgEjs5MDblti5vzKW8gzGCUFLS08RX63A';

async function main() {
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': anonKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@physio.com',
      password: 'adminpassword123'
    })
  });
  const data = await response.json();
  console.log("Login data:", JSON.stringify(data, null, 2));

  if (!data.user) {
    console.log("No user object. The user ID is probably:", data.id || "not found");
    return;
  }
  
  const userId = data.user.id;
  const token = data.access_token;
  
  console.log(`Setting up profile for user ${userId}...`);
  // Create profile
  const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      id: userId,
      email: 'admin@physio.com',
      role: 'admin',
      name: 'Admin User'
    })
  });
  
  if (!profileRes.ok) {
     const pData = await profileRes.json();
     console.error("Profile creation failed:", pData);
  } else {
     console.log("Admin account (admin@physio.com / adminpassword123) is ready!");
  }
}
main();
