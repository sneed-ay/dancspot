'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('お名前・メールアドレス・お問い合わせ内容は必須項目です');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setErrorMsg(data.error || '送信に失敗しました。時間をおいて再度お試しください。');
      }
    } catch {
      setErrorMsg('通信エラーが発生しました。時間をおいて再度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-6">
          <Link href="/" className="text-sm text-amber-700 hover:text-amber-900">
            ← トップに戻る
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            お問い合わせ
          </h1>
          <p className="mt-3 text-sm text-stone-500 leading-relaxed">
            DancSpotに関するご質問・ご要望・不具合報告など、お気軽にお寄せください。
            通常2〜3営業日以内にご返信いたします。
          </p>

          {done ? (
            <div className="mt-8 rounded-xl bg-green-50 border border-green-200 p-6 text-center">
              <p className="text-lg font-medium text-green-800">
                ✅ 送信しました
              </p>
              <p className="mt-2 text-sm text-green-700">
                お問い合わせを受け付けました。担当者から折り返しご連絡いたします。
              </p>
              <button
                onClick={() => setDone(false)}
                className="mt-4 text-sm text-green-700 hover:text-green-900 underline"
              >
                もう一件送る
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="山田 太郎"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="example@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-stone-700 mb-1">
                  件名
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="（任意）ご用件の概要"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1">
                  お問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="お問い合わせ内容をご記入ください"
                />
              </div>

              {errorMsg && (
                <p className="text-sm text-red-600">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-600 text-white py-2.5 rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50"
              >
                {submitting ? '送信中...' : '送信する'}
              </button>

              <p className="text-xs text-stone-400 leading-relaxed">
                送信いただいた内容は、お問い合わせへの対応のみに使用します。
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
