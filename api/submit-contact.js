import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, phone, company, project_type, budget, details, captchaToken, recaptchaToken } = req.body;
  const token = captchaToken || recaptchaToken;

  if (!token) {
    return res.status(400).json({ error: 'Captcha verification token is required.' });
  }

  const secretKey = process.env.HCAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'hCaptcha secret key is not configured on the server.' });
  }

  try {
    // Verify token with hCaptcha
    const verifyRes = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      return res.status(400).json({ error: 'Captcha verification failed. Please try again.' });
    }

    // Insert into Supabase database
    const { error } = await supabase
      .from('contact_submissions')
      .insert({
        name: name?.trim() || '',
        email: email?.trim() || '',
        phone: phone?.trim() || '',
        company: company?.trim() || '',
        project_type: project_type || 'AI Development',
        budget: budget || '',
        details: details?.trim() || '',
      });

    if (error) {
      throw error;
    }

    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Submit Contact Serverless Error:', error);
    return res.status(500).json({ error: error.message || 'Error processing your message.' });
  }
}
