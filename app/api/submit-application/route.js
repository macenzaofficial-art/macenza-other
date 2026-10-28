import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function isValidHttpUrl(urlStr) {
  if (typeof urlStr !== 'string' || !urlStr.trim()) return false;
  try {
    const parsed = new URL(urlStr.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const requiredFields = [
      'candidateName',
      'email',
      'phone',
      'location',
      'experience',
      'resumeUrl'
    ];

    for (const field of requiredFields) {
      const value = body?.[field];
      if (typeof value !== 'string' || value.trim() === '') {
        return NextResponse.json(
          { error: `Missing or invalid required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (!isValidHttpUrl(body?.resumeUrl)) {
      return NextResponse.json(
        { error: 'Invalid resume URL. Must be a valid HTTP or HTTPS URL.' },
        { status: 400 }
      );
    }

    const {
      candidateName,
      email,
      phone,
      location,
      experience,
      linkedInUrl,
      portfolioUrl,
      coverLetter,
      resumeUrl,
      jobId,
      captchaToken,
      recaptchaToken
    } = body;

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

    // Insert application record into Supabase
    const { error } = await supabase
      .from('applications')
      .insert([{
        candidate_name: candidateName || '',
        email: email || '',
        phone: phone || '',
        location: location || '',
        experience: experience || '',
        linkedin_url: linkedInUrl || '',
        portfolio_url: portfolioUrl || '',
        cover_letter: coverLetter || '',
        resume_url: resumeUrl || '',
        job_id: jobId || null
      }]);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Application submitted successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Submit Application Route Error:', error);
    return NextResponse.json({ error: error.message || 'Error processing your application.' }, { status: 500 });
  }
}
