import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, project_type, budget, details, captchaToken, recaptchaToken } = body;
    const token = captchaToken || recaptchaToken;

    if (!token) {
      return NextResponse.json({ error: 'Captcha verification token is required.' }, { status: 400 });
    }

    const secretKey = process.env.HCAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'hCaptcha secret key is not configured on the server.' }, { status: 500 });
    }

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
      return NextResponse.json({ error: 'Captcha verification failed. Please try again.' }, { status: 400 });
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

    return NextResponse.json({ success: true, message: 'Message sent successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Submit Contact Route Error:', error);
    return NextResponse.json({ error: error.message || 'Error processing your message.' }, { status: 500 });
  }
}
