import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
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
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* メインコンテンツ */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', zIndex: 10 }}>
          {/* アイコン（家型CSS） */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px' }}>
            <div style={{ width: '0', height: '0', borderLeft: '36px solid transparent', borderRight: '36px solid transparent', borderBottom: '32px solid #fbbf24' }} />
            <div style={{ width: '56px', height: '36px', background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '16px', height: '20px', background: '#1e3a5f', marginTop: '8px' }} />
            </div>
          </div>

          {/* タイトル */}
          <div
            style={{
              fontSize: '64px',
              fontWeight: '900',
              color: '#f1f5f9',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              textAlign: 'center',
            }}
          >
            不動産相場ナビ
          </div>

          {/* サブタイトル */}
          <div
            style={{
              fontSize: '28px',
              color: '#fbbf24',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
            }}
          >
            マップで見る取引価格データベース
          </div>

          {/* 区切り */}
          <div
            style={{
              width: '160px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)',
              margin: '4px 0',
            }}
          />

          {/* 統計バッジ */}
          <div style={{ display: 'flex', gap: '24px' }}>
            {[
              { value: '500万件+', label: '取引データ' },
              { value: '20年分', label: '蓄積期間' },
              { value: '47都道府県', label: '全国対応' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px 28px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  gap: '4px',
                }}
              >
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fbbf24' }}>{stat.value}</div>
                <div style={{ fontSize: '16px', color: '#94a3b8' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ドメイン */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            color: 'rgba(148,163,184,0.6)',
            fontSize: '18px',
            letterSpacing: '0.05em',
          }}
        >
          market.next-aura.com
        </div>

        {/* ブランド名 */}
        <div
          style={{
            position: 'absolute',
            top: '32px',
            right: '40px',
            color: 'rgba(148,163,184,0.5)',
            fontSize: '18px',
          }}
        >
          ネクソラ不動産
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
