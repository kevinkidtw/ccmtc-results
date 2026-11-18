import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    // 未設定 ADMIN_TOKEN 時一律拒絕，不回落到任何預設值
    const correctToken = process.env.ADMIN_TOKEN;
    if (!correctToken) {
      console.error('ADMIN_TOKEN 未設定，拒絕登入');
      return NextResponse.json({ success: false, error: '伺服器未完成設定' }, { status: 500 });
    }

    if (password === correctToken) {
      return NextResponse.json({ success: true, token: correctToken });
    } else {
      return NextResponse.json({ success: false, error: '密碼錯誤，請重新輸入。' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: '伺服器錯誤' }, { status: 500 });
  }
}
