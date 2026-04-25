import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  const response = new ImageResponse(
    (
      <div
        style={{
          width: '1500px',
          height: '500px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* グリッドパターン */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* グロー */}
        <div
          style={{
            position: 'absolute',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* メインコンテンツ - 横並び */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '48px', zIndex: 10 }}>
          {/* 左: アイコン + タイトル */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {/* アイコン（家型CSS） */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' }}>
              <div style={{ width: '0', height: '0', borderLeft: '40px solid transparent', borderRight: '40px solid transparent', borderBottom: '36px solid #fbbf24' }} />
              <div style={{ width: '64px', height: '40px', background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '18px', height: '22px', background: '#1e3a5f', marginTop: '8px' }} />
              </div>
            </div>
            <div
              style={{
                fontSize: '72px',
                fontWeight: '900',
                color: '#f1f5f9',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                textAlign: 'center',
              }}
            >
              不動産相場ナビ
            </div>
            <div
              style={{
                fontSize: '24px',
                color: '#fbbf24',
                fontWeight: 'bold',
                letterSpacing: '0.05em',
              }}
            >
              マップで見る取引価格データベース
            </div>
          </div>

          {/* 区切り */}
          <div
            style={{
              width: '2px',
              height: '240px',
              background: 'linear-gradient(180deg, transparent, #fbbf24, transparent)',
            }}
          />

          {/* 右: 統計バッジ縦並び */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { value: '500万件+', label: '取引データ' },
              { value: '20年分', label: '蓄積期間' },
              { value: '47都道府県', label: '全国対応' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '14px 28px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  gap: '16px',
                  minWidth: '280px',
                }}
              >
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fbbf24' }}>{stat.value}</div>
                <div style={{ fontSize: '18px', color: '#94a3b8' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ドメイン */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '40px',
            color: 'rgba(148,163,184,0.6)',
            fontSize: '20px',
            letterSpacing: '0.05em',
          }}
        >
          market.next-aura.com
        </div>

        {/* ブランド名 */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '40px',
            color: 'rgba(148,163,184,0.5)',
            fontSize: '18px',
          }}
        >
          ネクソラ不動産
        </div>
      </div>
    ),
    {
      width: 1500,
      height: 500,
    }
  )
  response.headers.set('Access-Control-Allow-Origin', '*')
  return response
}
