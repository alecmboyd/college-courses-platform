const fs = require('fs')

require('dotenv').config({ path: '.env.local' })

const SUPABASE_ACCESS_TOKEN = 'sbp_2bf321d4461ae32aa12f1d4876d6cbbbe7f0698b'
const PROJECT_REF = 'ifhpogurtmvmfwxwhlkp'

async function executeSQLViaAPI() {
  console.log('🚀 Executing SQL via Supabase Management API...\n')

  try {
    // Read the schema SQL
    const schemaSQL = fs.readFileSync('./supabase/schema.sql', 'utf8')
    const sampleDataSQL = fs.readFileSync('./supabase/sample-data.sql', 'utf8')

    // Prepare the complete SQL to execute
    const fullSQL = `
-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;

${schemaSQL}

${sampleDataSQL}
    `

    console.log('Executing SQL through Supabase Management API...')
    
    // Make API request to execute SQL
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: fullSQL
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.log('API Response:', response.status, error)
      
      // If API doesn't work, provide manual instructions
      console.log('\n' + '='.repeat(60))
      console.log('❌ MANUAL SETUP REQUIRED')
      console.log('='.repeat(60))
      console.log('\nThe Supabase Management API requires additional permissions.')
      console.log('Please manually execute the SQL in the Supabase Dashboard:\n')
      console.log('1. Go to: https://supabase.com/dashboard/project/ifhpogurtmvmfwxwhlkp/sql/new')
      console.log('2. Copy and paste this SQL:\n')
      console.log('--- BEGIN SQL ---')
      console.log(fullSQL.substring(0, 500) + '...\n[Full SQL in supabase/schema.sql and supabase/sample-data.sql]')
      console.log('--- END SQL ---')
      console.log('\n3. Click "Run" to execute the SQL')
      console.log('4. Then run: node verify-setup.js')
    } else {
      const result = await response.json()
      console.log('✅ SQL executed successfully!')
      console.log('Result:', result)
      
      console.log('\n' + '='.repeat(60))
      console.log('🎉 DATABASE SETUP COMPLETE!')
      console.log('='.repeat(60))
      console.log('\nYour College Courses Platform is ready!')
      console.log('Visit http://localhost:3000 to start using it.')
    }

  } catch (error) {
    console.error('Error:', error.message)
    
    // Provide clear manual instructions
    console.log('\n' + '='.repeat(60))
    console.log('📋 MANUAL SETUP INSTRUCTIONS')
    console.log('='.repeat(60))
    console.log('\nSince automated setup isn\'t working, please follow these steps:\n')
    console.log('1. Open Supabase SQL Editor:')
    console.log('   https://supabase.com/dashboard/project/ifhpogurtmvmfwxwhlkp/sql/new\n')
    console.log('2. Copy the ENTIRE contents of these files and run them in order:')
    console.log('   a) supabase/schema.sql (creates tables)')
    console.log('   b) supabase/sample-data.sql (adds sample courses)\n')
    console.log('3. After running the SQL, verify with:')
    console.log('   node verify-setup.js\n')
    console.log('This will take less than 2 minutes and your platform will be fully functional!')
  }
}

executeSQLViaAPI()