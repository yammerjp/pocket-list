import Website from '../types/website'

function screenshot(url: string) {
  const base64url = window
    .btoa(unescape(encodeURIComponent(url)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  return `/api/img/800x450/${base64url}.png`
}

function timeDiff(from: Date) {
  const diffMs = new Date().getTime() - from.getTime()
  const diff = new Date(diffMs)

  // 大きい単位から順に表示
  if (diff.getUTCFullYear() - 1970) {
    return diff.getUTCFullYear() - 1970 + '年前'
  } else if (diff.getUTCMonth()) {
    return diff.getUTCMonth() + 'ヶ月前'
  } else if (diff.getUTCDate() - 1) {
    return diff.getUTCDate() - 1 + '日前'
  } else if (diff.getUTCHours()) {
    return diff.getUTCHours() + '時間前'
  } else if (diff.getUTCMinutes()) {
    return diff.getUTCMinutes() + '分前'
  } else {
    return 'たった今'
  }
}

function titleFontSize(imgWidth: Number) {
  if (imgWidth < 100) {
    return 10
  }
  if (imgWidth < 150) {
    return 13
  }
  if (imgWidth < 200) {
    return 14
  }
  if (imgWidth < 300) {
    return 16
  }
  if (imgWidth < 300) {
    return 18
  }
  if (imgWidth < 400) {
    return 20
  }
  if (imgWidth < 500) {
    return 22
  }
  if (imgWidth < 600) {
    return 24
  }
  return 32
}

export default function WebsiteComponent({
  website,
  imgWidth,
  imgMarginWidth,
}: {
  website: Website;
  imgWidth: number;
  imgMarginWidth: number;
}) {
  return (
    <div
      className="website"
      key={website.id}
      style={{
        margin: imgMarginWidth,
        marginTop: (imgWidth * 32) / 400,
        width: imgWidth,
        textAlign: "left",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        border: "solid 1px #cccccc",
      }}
    >
      <div className="link-wrapper">
        <a href={website.url} target="_blank" rel="noopener">
          <div
            style={{
              background: 'no-repeat center url("/loading-icon.gif")',
              margin: 0,
              padding: 0,
            }}
          >
            <img
              src={screenshot(website.url)}
              width={imgWidth-2}
              height={((imgWidth-2) * 9) / 16}
              style={{
                borderRadius: "8px 8px 0px 0px",
              }}
            />
          </div>
          <div style={{ margin: "4px 8px" }}>
            <h3 style={{ fontSize: titleFontSize(imgWidth), margin: 0 }}>
              {website.title}
            </h3>
          </div>
        </a>
      </div>
      <div
        className="supplement"
        style={{
          fontSize: Math.max(Math.floor(titleFontSize(imgWidth) * 0.7), 12),
          margin: "4px 8px",
        }}
      >
        {website.host} - {timeDiff(website.createdAt)}
      </div>
    </div>
  );
}
