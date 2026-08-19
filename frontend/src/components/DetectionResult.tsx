import type { PredictionResponse } from '../types'

interface Props {
  result: PredictionResponse
}

export default function DetectionResult({ result }: Props) {
  const { annotated_image_base64, num_people, num_violations, is_compliant, inference_ms, violations } = result

  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-6">
      <div className="rounded-md overflow-hidden border border-asphalt-lighter bg-asphalt-light">
        <img
          src={`data:image/jpeg;base64,${annotated_image_base64}`}
          alt="Annotated detection result"
          className="w-full h-auto"
        />
      </div>

      <div className="space-y-4">
        <div
          className={`rounded-sm p-4 border-l-4 ${
            is_compliant ? 'border-safe bg-safe/10' : 'border-alert bg-alert/10'
          }`}
        >
          <p className={`font-display text-xl tracking-wide ${is_compliant ? 'text-safe' : 'text-alert'}`}>
            {is_compliant ? 'SITE COMPLIANT' : `${num_violations} VIOLATION${num_violations === 1 ? '' : 'S'}`}
          </p>
          <p className="text-sm text-steel mt-1">
            {num_people} {num_people === 1 ? 'person' : 'people'} detected · {inference_ms.toFixed(0)}ms
          </p>
        </div>

        {violations.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-steel">Flagged</h3>
            {violations.map((v, i) => (
              <div key={i} className="rounded-sm bg-asphalt-light border border-asphalt-lighter p-3 text-sm">
                <p className="text-paper">
                  Person {v.person_index + 1} missing:{' '}
                  <span className="text-alert font-medium">{v.missing.join(', ')}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-steel">Detections</h3>
          <div className="flex flex-wrap gap-1.5">
            {result.detections.map((d, i) => (
              <span
                key={i}
                className="text-xs font-mono px-2 py-1 rounded-sm bg-asphalt-light border border-asphalt-lighter text-paper"
              >
                {d.class_name} {(d.confidence * 100).toFixed(0)}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
