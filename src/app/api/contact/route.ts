// POST /api/contact - forward inquiry to dancspot777@gmail.com via Formsubmit
// First submission triggers a one-time activation email to dancspot777@gmail.com.
// Click the link in that email to activate the form; subsequent submissions flow through.

import { NextRequest, NextResponse } from 'next/server';

const RECIPIENT = 'dancspot777@gmail.com';
const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/' + RECIPIENT;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'お名前・メールアドレス・お問い合わせ内容は必須です' },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      );
    }
    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'お問い合わせ内容は5000文字以内でお願いします' },
        { status: 400 }
      );
    }

    const res = await fetch(FORMSUBMIT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        お名前: name,
        メールアドレス: email,
        件名: subject || '(指定なし)',
        お問い合わせ内容: message,
        _subject: '[DancSpotお問い合わせ] ' + (subject || name + 'さんより'),
        _replyto: email,
        _template: 'table',
        _captcha: 'false',
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('Formsubmit failed:', res.status, errText);
      return NextResponse.json(
        { error: 'メール送信サービスへの転送に失敗しました。時間をおいて再度お試しください。' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
