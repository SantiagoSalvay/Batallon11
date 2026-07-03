import { useEffect, useRef, useState } from 'react';
import { Download, Minus, Plus, RotateCcw, X } from 'lucide-react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

const toolbarButtonClass =
  'grid h-10 w-10 place-items-center rounded-md text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] transition hover:bg-black/25 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60';

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
  onClose,
  caption,
}) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [imageBox, setImageBox] = useState(null);
  const downloadName = imageDownloadName(src);

  const measureImage = () => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return;

    const containerRect = container.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    setImageBox({
      left: imageRect.left - containerRect.left,
      top: imageRect.top - containerRect.top,
      width: imageRect.width,
      height: imageRect.height,
    });
  };

  useEffect(() => {
    measureImage();

    const container = containerRef.current;
    if (!container) return undefined;

    const observer = new ResizeObserver(() => measureImage());
    observer.observe(container);
    window.addEventListener('resize', measureImage);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measureImage);
    };
  }, [src]);

  const controlsStyle = imageBox
    ? {
        left: `${imageBox.left}px`,
        top: `${imageBox.top}px`,
        width: `${imageBox.width}px`,
      }
    : { left: 0, right: 0, top: 0 };

  const captionStyle = imageBox
    ? {
        left: `${imageBox.left}px`,
        top: `${imageBox.top + imageBox.height}px`,
        width: `${imageBox.width}px`,
      }
    : { left: 0, right: 0, bottom: 0 };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-visible bg-transparent ${className}`}
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
        wheel={{ step: 0.015 }}
        pinch={{ step: 5 }}
        doubleClick={{ mode: 'toggle', step: 1.4 }}
        panning={{ velocityDisabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div
              className="pointer-events-none absolute z-20 flex items-center justify-between py-2 pl-2 pr-0"
              style={controlsStyle}
            >
              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className={`${toolbarButtonClass} pointer-events-auto`}
                  title="Cerrar"
                  aria-label="Cerrar imagen"
                >
                  <X className="h-5 w-5" strokeWidth={2.1} />
                </button>
              ) : (
                <div className="h-10 w-10" />
              )}

              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => zoomOut(0.3)}
                  className={toolbarButtonClass}
                  title="Alejar"
                  aria-label="Alejar imagen"
                >
                  <Minus className="h-5 w-5" strokeWidth={2.1} />
                </button>
                <button
                  type="button"
                  onClick={() => resetTransform()}
                  className={toolbarButtonClass}
                  title="Restablecer"
                  aria-label="Restablecer zoom"
                >
                  <RotateCcw className="h-5 w-5" strokeWidth={2.1} />
                </button>
                <button
                  type="button"
                  onClick={() => zoomIn(0.3)}
                  className={toolbarButtonClass}
                  title="Acercar"
                  aria-label="Acercar imagen"
                >
                  <Plus className="h-5 w-5" strokeWidth={2.1} />
                </button>
                <a
                  href={src}
                  download={downloadName}
                  className={toolbarButtonClass}
                  title="Descargar"
                  aria-label="Descargar imagen"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Download className="h-5 w-5" strokeWidth={2.1} />
                </a>
              </div>
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
                ref={imageRef}
                src={src}
                alt={alt}
                draggable={false}
                onLoad={measureImage}
                className={`max-h-full max-w-full select-none object-contain ${imageClassName}`}
              />
            </TransformComponent>

            {caption && (
              <div
                className="pointer-events-none absolute z-20 -translate-y-full px-4 pb-2 pt-10 text-center text-sm font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                style={captionStyle}
              >
                {caption}
              </div>
            )}
          </>
        )}
      </TransformWrapper>
    </div>
  );
}