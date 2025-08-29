const fs = require('fs');

// Read the SQL file
const sqlContent = fs.readFileSync('/Users/alecboyd/alec-boyd-platform/setup-database.sql', 'utf8');

// Split into individual statements
const statements = sqlContent
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

console.log(`Found ${statements.length} SQL statements to execute`);

// Execute each statement
async function executeSql(query) {
  const response = await fetch('https://api.supabase.com/v1/projects/ifhpogurtmvmfwxwhlkp/sql', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sbp_2bf321d4461ae32aa12f1d4876d6cbbbe7f0698b',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query })
  });
  
  const result = await response.json();
  return { success: response.ok, result, query: query.substring(0, 100) + '...' };
}

// Execute all statements
async function setupDatabase() {
  console.log('Starting database setup...');
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
    console.log(stmt.substring(0, 100) + '...');
    
    try {
      const result = await executeSql(stmt);
      if (result.success) {
        console.log('✅ Success');
      } else {
        console.log('❌ Failed:', result.result);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\nDatabase setup complete!');
}

setupDatabase();