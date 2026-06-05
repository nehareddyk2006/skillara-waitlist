import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize DatabaseSync using Node's native sqlite module
console.log('Initializing SQLite database via node:sqlite...');
const db = new DatabaseSync('waitlist.db');

// Create waitlist schema
db.exec(`
  CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    college TEXT NOT NULL,
    interest TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Add columns for new form fields if the table already exists but schema is older
const existingColumns = db.prepare(`PRAGMA table_info(waitlist)`).all().map(col => col.name);
if (!existingColumns.includes('name')) {
  db.exec(`ALTER TABLE waitlist ADD COLUMN name TEXT`);
}
if (!existingColumns.includes('interest')) {
  db.exec(`ALTER TABLE waitlist ADD COLUMN interest TEXT`);
}

console.log('Database initialized successfully.');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Email validation helper
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// REST API: Register Waitlist Submission
app.post('/api/waitlist', (req, res) => {
  const { name, email, college, interest } = req.body;

  // Basic validation
  if (!name || !email || !college) {
    return res.status(400).json({ 
      success: false, 
      error: 'TELEMETRY_ERROR: Name, email, and college fields are required.' 
    });
  }

  const cleanName = name.trim();
  if (cleanName.length < 2) {
    return res.status(400).json({ 
      success: false, 
      error: 'TELEMETRY_ERROR: Invalid name provided.' 
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanCollege = college.trim();
  const cleanInterest = interest ? interest.trim() : null;

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ 
      success: false, 
      error: 'TELEMETRY_ERROR: Invalid email format.' 
    });
  }

  if (cleanCollege.length < 2) {
    return res.status(400).json({ 
      success: false, 
      error: 'TELEMETRY_ERROR: Invalid college/university name.' 
    });
  }

  if (cleanCollege.length < 2) {
    return res.status(400).json({ 
      success: false, 
      error: 'TELEMETRY_ERROR: Invalid college/university name.' 
    });
  }

  try {
    // Check if email already exists
    const checkStmt = db.prepare('SELECT id FROM waitlist WHERE email = ?');
    const existing = checkStmt.get(cleanEmail);

    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: 'DUPLICATE_NODE: Email is already registered in the system.' 
      });
    }

    // Insert into database
    const insertStmt = db.prepare('INSERT INTO waitlist (name, email, college, interest) VALUES (?, ?, ?, ?)');
    insertStmt.run(cleanName, cleanEmail, cleanCollege, cleanInterest);

    // Get current total count
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM waitlist');
    const countResult = countStmt.get();
    const currentQueue = countResult.count;

    return res.status(201).json({
      success: true,
      message: 'TRANSMISSION_COMPLETE: Node registered.',
      data: {
        queuePosition: currentQueue,
        nodeId: `SKL-${String(currentQueue).padStart(4, '0')}`
      }
    });

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'SYSTEM_FAULT: Database operation failed.' 
    });
  }
});

// REST API: Get Waitlist Telemetry Stats (For Live Telemetry Overlay Dashboard)
app.get('/api/waitlist/telemetry', (req, res) => {
  try {
    // 1. Total registrations
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM waitlist');
    const totalCount = countStmt.get().count;

    // 2. Recent activity (Last 5 registered universities, email fully withheld for privacy)
    const recentStmt = db.prepare('SELECT college, timestamp FROM waitlist ORDER BY timestamp DESC LIMIT 5');
    const recentRows = recentStmt.all();

    const recentActivity = recentRows.map((row) => {
      return {
        college: row.college,
        timestamp: row.timestamp
      };
    });

    // 3. Top universities signed up
    const topCollegesStmt = db.prepare(`
      SELECT college, COUNT(*) as count 
      FROM waitlist 
      GROUP BY college 
      ORDER BY count DESC 
      LIMIT 3
    `);
    const topColleges = topCollegesStmt.all();

    // 4. Simulated signal noise and system specs (gives F1 telemetry feel)
    const serverLoad = (Math.random() * 5 + 1.2).toFixed(2); // simulated server response latency
    const signalStrength = (98 + Math.random() * 2).toFixed(1); // simulated signal strength

    return res.status(200).json({
      success: true,
      telemetry: {
        totalQueue: totalCount,
        recentNodes: recentActivity,
        topNodes: topColleges,
        systemSpecs: {
          nodeCount: totalCount,
          systemStatus: 'NOMINAL',
          telemetryFrequency: '10Hz',
          pingMs: serverLoad,
          signalDb: signalStrength,
          serverTime: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Telemetry Fetch Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'SYSTEM_FAULT: Telemetry diagnostic failed.' 
    });
  }
});

// REST API: Get All Registrants (Admin Only)
app.get('/api/admin/waitlist', (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, email, college, timestamp FROM waitlist ORDER BY timestamp DESC');
    const rows = stmt.all();
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Admin Fetch Error:', error);
    return res.status(500).json({ success: false, error: 'SYSTEM_FAULT: Database query failed.' });
  }
});

// REST API: Export Waitlist as CSV File
app.get('/api/admin/waitlist/csv', (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, email, college, timestamp FROM waitlist ORDER BY timestamp ASC');
    const rows = stmt.all();
    
    // Construct CSV content
    let csvContent = 'ID,Email,College/University,Timestamp\n';
    rows.forEach(row => {
      // Escape quotes and wrap values in quotes to handle commas
      const escapedEmail = `"${row.email.replace(/"/g, '""')}"`;
      const escapedCollege = `"${row.college.replace(/"/g, '""')}"`;
      csvContent += `${row.id},${escapedEmail},${escapedCollege},${row.timestamp}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=skillara_waitlist.csv');
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('CSV Export Error:', error);
    return res.status(500).send('SYSTEM_FAULT: CSV Generation Failed.');
  }
});

// Admin Dashboard Page Route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve frontend static content fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  SKILLARA CORE TELEMETRY PORT ACTIVE`);
  console.log(`  ACCESS LEVEL: EXCLUSIVE`);
  console.log(`  LISTENING AT: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
