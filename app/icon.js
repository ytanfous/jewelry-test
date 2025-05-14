import {ImageResponse} from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'
const svgDataURI = "data:image/svg+xml,%3Csvg%20id='Layer_3'%20data-name='Layer%203'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20viewBox='0%200%2016%2016'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%20%7B%20fill%3A%20%23fff%3B%20%7D%20.cls-2%20%7B%20stroke-width%3A%20.3px%3B%20%7D%20.cls-2%2C%20.cls-3%2C%20.cls-4%20%7B%20fill%3A%20none%3B%20stroke%3A%20%23fff%3B%20stroke-miterlimit%3A%2010%3B%20%7D%20.cls-3%20%7B%20stroke-width%3A%20.26px%3B%20%7D%20.cls-5%20%7B%20clip-path%3A%20url%28%23clippath%29%3B%20%7D%20.cls-6%20%7B%20fill%3A%20%239b9b9b%3B%20%7D%20.cls-4%20%7B%20stroke-width%3A%20.22px%3B%20%7D%20%3C%2Fstyle%3E%3CclipPath%20id='clippath'%3E%3Cpolygon%20class='cls-3'%20points='6.74%204.76%206.3%205.3%207.85%206.88%209.32%205.3%208.89%204.76%206.74%204.76'%2F%3E%3C%2FclipPath%3E%3C%2Fdefs%3E%3Crect%20x='0'%20y='0'%20width='16'%20height='16'%20rx='8'%20ry='8'%2F%3E%3Cpath%20class='cls-6'%20d='m8.76%2C10.9c-.74.34-1.87.36-2.41-.33-.28-.35-.3-.78-.3-1h0c.27.73.97%2C1.26%2C1.8%2C1.26%2C1.06%2C0%2C1.92-.86%2C1.92-1.92s-.86-1.92-1.92-1.92c-.6%2C0-1.14.28-1.49.71-.01.00-.02-.01-.03-.02.08-.13.45-.71%2C1.19-.91.9-.24%2C1.61.27%2C1.73.36.79.59.84%2C1.51.84%2C1.64.03.93-.56%2C1.77-1.34%2C2.13Z'%2F%3E%3Cpath%20class='cls-2'%20d='m7.85%2C6.37c-1.4%2C0-2.54%2C1.14-2.54%2C2.54s1.14%2C2.54%2C2.54%2C2.54%2C2.54-1.14%2C2.54-2.54-1.14-2.54-2.54-2.54Zm-1.49%2C1.33c.35-.43.89-.71%2C1.49-.71%2C1.06%2C0%2C1.92.86%2C1.92%2C1.92s-.86%2C1.92-1.92%2C1.92c-.83%2C0-1.53-.52-1.8-1.26-.08-.21-.12-.43-.12-.66%2C0-.46.16-.88.43-1.21Z'%2F%3E%3Cg%3E%3Cg%20class='cls-5'%3E%3Cpath%20class='cls-6'%20d='m7.81%2C7.54l-1.43-1.91%2C1.18.39c.16.05.33.04.48-.04l.77-.41.32.67-1.32%2C1.3Z'%2F%3E%3Cpath%20class='cls-6'%20d='m8.37%2C4.55c.06.04.34.23.43.61.06.27%2C0%2C.49-.04.58.47-.09.93-.17%2C1.4-.26.10-.52-.18-1.02-.63-1.2-.39-.16-.85-.05-1.16.28Z'%2F%3E%3C%2Fg%3E%3Cpolygon%20class='cls-3'%20points='6.74%204.76%206.3%205.3%207.85%206.88%209.32%205.3%208.89%204.76%206.74%204.76'%2F%3E%3C%2Fg%3E%3Cpolyline%20class='cls-4'%20points='7.25%204.76%207.03%205.3%207.85%206.88'%2F%3E%3Cpolyline%20class='cls-4'%20points='8.39%204.76%208.58%205.3%207.85%206.88'%2F%3E%3Cline%20class='cls-4'%20x1='6.44'%20y1='5.3'%20x2='9.32'%20y2='5.3'%2F%3E%3Cpath%20class='cls-1'%20d='m6.89%2C7.07c-1.74-2.88-6.01.22-2.68%2C2.13.74.4%2C1.67.32%2C2.4-.12-.68.51-1.67.67-2.48.27-3.69-1.97%2C1.01-5.59%2C2.75-2.28h0Z'%2F%3E%3Cpath%20class='cls-1'%20d='m6.69%2C6.94c-2.28-2.23-5.21.93-2.21%2C2.67.69.38%2C1.57.21%2C2.21-.28-.6.56-1.52.8-2.28.43-3.33-1.81-.04-5.45%2C2.29-2.83h0Z'%2F%3E%3Cpath%20class='cls-1'%20d='m6.64%2C7.31c-.49-.32-3.01-.91-2.21.31-.10-.09-.20-.19-.26-.33-.07-.13-.02-.35.12-.44.77-.38%2C1.76-.11%2C2.35.45h0Z'%2F%3E%3Cpath%20class='cls-1'%20d='m4.28%2C7.75c-.23-.26-.27-.87.16-.93-.32.22-.21.59-.16.93h0Z'%2F%3E%3Cpath%20class='cls-1'%20d='m8.61%2C7.07c1.74-3.32%2C6.44.31%2C2.75%2C2.28-.81.4-1.79.24-2.48-.27.73.44%2C1.67.52%2C2.4.12%2C3.33-1.91-.94-5.01-2.68-2.13h0Z'%2F%3E%3Cpath%20class='cls-1'%20d='m8.81%2C6.94c2.33-2.05%2C5.58%2C1.54%2C2.21%2C2.68-.64.49-1.52.66-2.28.28.64.55%2C1.52.66%2C2.21.12%2C3.16-2.09.49-5.47-2.29-2.75h0Z'%2F%3E%3Cpath%20class='cls-1'%20d='m8.85%2C7.31c.47-.32%2C3.01-.91%2C2.21.31.10-.09.20-.19.26-.33.07-.13.02-.35-.12-.44-.77-.38-1.76-.11-2.35.45h0Z'%2F%3E%3Cpath%20class='cls-1'%20d='m11.21%2C7.75c.23-.26.27-.87-.16-.93.32.22.21.59.16.93h0Z'%2F%3E%3C%2Fsvg%3E";

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 28,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'black',
                }}
            ><img src={svgDataURI} alt="SVG Image"/>
            </div>
        ),
        {
            // For convenience, we can re-use the exported icons size metadata
            // config to also set the ImageResponse's width and height.
            ...size,
        }
    )
}