const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { supabase, supabaseAdmin } = require('./supabaseClient');
const trafficSim = require('./trafficSimulation');

// Port 5000: Auth & Static Data
// Note: AI Traffic & Services simulation has been moved to Python (Port 8000)

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.post('/api/auth/seed-demo-users', async (req, res) => {
    const demoUsers = [
        { email: 'admin1@example.com', password: 'admin1', role: 'admin' },
        { email: 'admin2@example.com', password: 'admin2', role: 'admin' },
        { email: 'user1@example.com', password: 'user1', role: 'user' },
        { email: 'user2@example.com', password: 'user2', role: 'user' }
    ];

    try {
        const seeded = [];

        for (const demo of demoUsers) {
            const { data: existingList, error: listError } = await supabaseAdmin.auth.admin.listUsers({
                page: 1,
                perPage: 1000
            });

            if (listError) throw listError;

            let existingUser = existingList?.users?.find((u) => u.email === demo.email);

            if (!existingUser) {
                const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
                    email: demo.email,
                    password: demo.password,
                    email_confirm: true
                });
                if (createError) throw createError;
                existingUser = created.user;
            } else {
                const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                    password: demo.password,
                    email_confirm: true
                });
                if (updateError) throw updateError;
            }

            const { error: upsertError } = await supabaseAdmin
                .from('users')
                .upsert({ id: existingUser.id, email: demo.email, role: demo.role }, { onConflict: 'id' });

            if (upsertError) throw upsertError;

            seeded.push({ email: demo.email, role: demo.role });
        }

        res.json({ success: true, users: seeded });
    } catch (err) {
        res.status(500).json({
            error: err.message,
            hint: 'Set SUPABASE_SERVICE_ROLE_KEY in server/.env for admin operations.'
        });
    }
});

// Setup Routes
app.get('/api/dashboard-data', async (req, res) => {
   try {
       const [alerts, traffic, parking] = await Promise.all([
           supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(5),
           supabase.from('traffic').select('*'),
           supabase.from('parking').select('*')
       ]);
       res.json({
           alerts: alerts.data || [],
           traffic: traffic.data || [],
           parking: parking.data || []
       });
   } catch(err) {
       res.status(500).json({error: err.message});
   }
});

app.post('/api/alerts', async (req, res) => {
    const { type, message, area } = req.body;
    const { data, error } = await supabase.from('alerts').insert([{ type, message, area }]).select();
    if(error) return res.status(400).json({ error: error.message });
    res.json(data);
});

app.get('/api/alerts', async (req, res) => {
    const { data, error } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
    if(error) return res.status(400).json({ error: error.message });
    res.json(data);
});

app.post('/api/bookings', async (req, res) => {
    const { user_id, transport_id } = req.body;
    const { data, error } = await supabase.from('bookings').insert([{ user_id, transport_id, status: 'confirmed' }]).select();
    if(error) return res.status(400).json({ error: error.message });
    res.json(data);
});

app.get('/api/transport', async (req, res) => {
    const { data, error } = await supabase.from('transport').select('*');
    if(error) return res.status(400).json({ error: error.message });
    res.json(data);
});

app.get('/api/parking', async (req, res) => {
    const { data, error } = await supabase.from('parking').select('*');
    if(error) return res.status(400).json({ error: error.message });
    res.json(data);
});

app.get('/api/traffic', async (req, res) => {
    const { data, error } = await supabase.from('traffic').select('*');
    if(error) return res.status(400).json({ error: error.message });
    res.json(data);
});

app.get('/api/electricity', async (req, res) => {
    const { data, error } = await supabase.from('electricity').select('*');
    if(error) return res.status(400).json({ error: error.message });
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
