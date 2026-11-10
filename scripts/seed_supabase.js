const fs = require('fs');
const https = require('https');

const SUPABASE_URL = 'cdqioprsbiqdcihbwbbi.supabase.co';
const ANON_KEY = 'sb_publishable_SKMShrv9ae3ZQ6YG1PpPjg_7DZ5-H3n';

const storePath = 'data-store/cube_cms_store.json';
if (!fs.existsSync(storePath)) {
  console.log('No local data-store found.');
  process.exit(0);
}

const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

function postData(table, rows) {
  return new Promise((resolve) => {
    if (!rows || rows.length === 0) return resolve();
    const data = JSON.stringify(rows);
    const req = https.request({
      hostname: SUPABASE_URL,
      path: `/rest/v1/${table}`,
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
        'Content-Length': Buffer.byteLength(data),
      }
    }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        console.log(`Seeded ${table}: status ${res.statusCode}`);
        resolve();
      });
    });
    req.on('error', (e) => {
      console.error(`Error seeding ${table}:`, e.message);
      resolve();
    });
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('Seeding initial data to Supabase...');
  
  if (store.projects && store.projects.length > 0) {
    const formattedProjects = store.projects.slice(0, 15).map(p => ({
      slug: p.slug,
      title: p.title,
      category: p.category || 'General',
      client_name: p.client || 'Government of Tamil Nadu',
      location: p.location || 'Tamil Nadu',
      summary: p.summary || p.description || '',
      hero_image: p.heroImage || p.image || '/images/hero/slides_iit-tirupathi.jpg',
      status: p.status || 'published',
      featured: Boolean(p.featured),
    }));
    await postData('projects', formattedProjects);
  }

  if (store.news && store.news.length > 0) {
    const formattedNews = store.news.slice(0, 10).map(n => ({
      slug: n.slug || n.id,
      title: n.title,
      summary: n.summary || n.excerpt || '',
      content: n.content || n.summary || '',
      category: n.category || 'Institutional',
      date: (n.date && n.date.slice(0, 10)) || '2026-11-01',
      image: n.image || '/images/hero/slides_building-training-team.jpg',
      status: n.status || 'published',
      featured: Boolean(n.featured),
    }));
    await postData('news', formattedNews);
  }

  if (store.careers && store.careers.length > 0) {
    const formattedCareers = store.careers.map(c => ({
      title: c.title,
      department: c.department || 'Applied Engineering',
      location: c.location || 'Chennai / IIT Madras Research Park',
      type: c.type || 'Full-Time',
      experience_level: c.experienceLevel || c.experience || '2+ Years',
      description: c.description || '',
      status: c.status || 'published',
      is_active: true,
    }));
    await postData('careers', formattedCareers);
  }

  console.log('Seed process complete!');
}

run();
