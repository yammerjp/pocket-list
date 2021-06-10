import { useEffect, useState } from "react";
import Website from "../types/website";
import WebsiteComponent from "./website";

function getPageWidth() {
  if (!process.browser) {
    return 320;
  }
  const width = window.document.body.clientWidth;
  if (width > 900) {
    return width - 100;
  }
  if (width > 800) {
    return 800;
  }
  return width;
}

type ListPageState = {
  pageWidth: number;
  column: number;
  imgRatio: number;
  visibleWebsites: number;
};

const imgWidthMin = 100;
const imgWidthMax = 800;
const imgMarginWidth = 8;
const pageMarginWidth = 8;

function getOuterImgWidth(imgWidth: number): number {
  return imgWidth + imgMarginWidth * 2;
}
function getInnerPageWidth(pageWidth: number): number {
  return pageWidth - pageMarginWidth * 2;
}
function getColumnMin(pageWidth: number): number {
  return Math.max(
    Math.floor(getInnerPageWidth(pageWidth) / getOuterImgWidth(imgWidthMax)),
    1
  );
}
function getColumnMax(pageWidth: number): number {
  return Math.floor(
    getInnerPageWidth(pageWidth) / getOuterImgWidth(imgWidthMin)
  );
}
function getColumn(columnWill: number, pageWidth: number): number {
  return Math.min(
    Math.max(columnWill, getColumnMin(pageWidth)),
    getColumnMax(pageWidth)
  );
}

function getColumnFromImgRatio(pageWidth: number, imgRatio: number) {
  const imgWidth = pageWidth * imgRatio;
  const outerImgWidth = getOuterImgWidth(imgWidth);
  const innerPageWidth = getInnerPageWidth(pageWidth);
  return getColumn(Math.round(innerPageWidth / outerImgWidth), pageWidth);
}

function getImgWidth(column: number, pageWidth: number): number {
  return Math.min(
    800,
    getInnerPageWidth(pageWidth) / getColumn(column, pageWidth) -
      imgMarginWidth * 2
  );
}

function getRatio(column: number, pageWidth: number): number {
  const imgWidth = getImgWidth(column, pageWidth);
  return imgWidth / pageWidth;
}

function initialState(): ListPageState {
  const pageWidth = getPageWidth();
  const column = getColumnMin(pageWidth);
  const imgWidth = getImgWidth(column, pageWidth);
  const imgRatio = imgWidth / pageWidth;
  return { pageWidth, column, imgRatio, visibleWebsites: 100 };
}

function scrollPosition():number {
  if (!process.browser) {
    return 0
  }
  const scrollableY = document.body.clientHeight - window.innerHeight
  if (scrollableY <= 0) {
    return 0
  }
  const scrolledY = window.scrollY
  return scrolledY / scrollableY
}

export default function WebsitesComponent({
  websites,
}: {
  websites: Website[];
}) {
  const [state, setState] = useState<ListPageState>(initialState());

  const columnMax = getColumnMax(state.pageWidth);
  const columnMin = getColumnMin(state.pageWidth);
  const imgWidth = Math.floor(getImgWidth(state.column, state.pageWidth));

  useEffect(() => {
    if (!process.browser) {
      return;
    }
    window.addEventListener("resize", () => {
      console.log("resize event");
      setState(function (prevState: ListPageState): ListPageState {
        const pageWidth = getPageWidth();
        const { imgRatio, visibleWebsites } = prevState;
        const column = getColumnFromImgRatio(pageWidth, imgRatio);
        return { pageWidth, column, imgRatio, visibleWebsites };
      });
    });

    window.addEventListener('scroll', () => {
      const pos = scrollPosition()
      console.log(pos)
      if (pos> 0.95) {
        console.log('strech')
        setState(({pageWidth, column, imgRatio, visibleWebsites}) => ({
            pageWidth, column, imgRatio, visibleWebsites: visibleWebsites+column*3,
        }))
      }
    })
  }, []);

  return (
    <div>
      <div>
        <input
          type="range"
          min={0}
          max={columnMax - columnMin}
          onChange={({ target: { value } }: any) =>
            setState(({ pageWidth, visibleWebsites }) => ({
              pageWidth,
              column: columnMax - value,
              imgRatio: getRatio(columnMax - value, pageWidth),
              visibleWebsites,
            }))
          }
          value={columnMax - state.column}
        />
      </div>
      <div
        className="websites"
        style={{
          display: "flex",
          flexWrap: "wrap",
          margin: "0 auto",
          width: getOuterImgWidth(imgWidth) * state.column,
          boxAlign: 'start',
          //  flexAlign: 'start',
            alignItems: 'flex-start',
        }}
      >
        {websites.slice(0, state.visibleWebsites).map((website) => (
          <WebsiteComponent
            website={website}
            imgWidth={imgWidth}
            imgMarginWidth={imgMarginWidth}
            key={website.id}
          />
        ))}
      </div>
    </div>
  );
}
