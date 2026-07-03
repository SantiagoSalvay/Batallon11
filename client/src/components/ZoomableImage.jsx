import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

const controlClass =
  'grid h-9 w-9 place-items-center rounded-md border border-white/15 bg-black/70 text-sm font-bold text-white shadow-lg transition hover:bg-white hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-white/70';

const downloadClass =
  'inline-flex h-9 items-center rounded-md border border-white/15 bg-black/70 px-3 text-sm font-bold text-white shadow-lg transition hover:bg-white hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-white/70';

function imageDownloadName(src) {
  try {
    const url = new URL(src, window.location.href);
    return url.pathname.split('/').filter(Boolean).pop() || 'imagen-batallon-11';
  } catch {
    return 'imagen-batallon-11';
  }
}

export default function ZoomableImage({
  src,
  alt = '',
  imageKey,
  className = '',
  imageClassName = '',
}) {
  const downloadName = imageDownloadName(src);

  return (
    <div
      className={`relative overflow-hidden bg-black ${className}`}
      onClick={(event) => event.stopPropagation()}
    >
      <TransformWrapper
        key={imageKey || src}
        initialScale={1}
        minScale={1}
        maxScale={4}
        centerOnInit
        centerZoomedOut
        limitToBounds
        wheel={{ step: 0.02 }}
        pinch={{ step: 5 }}
        doubleClick={{ mode: 'toggle', step: 1.4 }}
        panning={{ velocityDisabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute right-3 top-3 z-20 flex gap-2">
              <button
                type="button"
                onClick={() => zoomOut(0.35)}
                className={controlClass}
                title="Alejar"
                aria-label="Alejar imagen"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => resetTransform()}
                className={controlClass}
                title="Restablecer"
                aria-label="Restablecer zoom"
              >
                1:1
              </button>
              <button
                type="button"
                onClick={() => zoomIn(0.35)}
                className={controlClass}
                title="Acercar"
                aria-label="Acercar imagen"
              >
                +
              </button>
              <a
                href={src}
                download={downloadName}
                className={downloadClass}
                title="Descargar"
                aria-label="Descargar imagen"
                onClick={(event) => event.stopPropagation()}
              >
                Descargar
              </a>
            </div>

            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={src}
                alt={alt}
                draggable={false}
                className={`max-h-full max-w-full select-none object-contain ${imageClassName}`}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
