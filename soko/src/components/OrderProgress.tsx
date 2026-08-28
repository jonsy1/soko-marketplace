const STEPS = ['NEW', 'CONFIRMED', 'PROCESSING', 'READY', 'DELIVERED'];

const STEP_LABELS: Record<string, string> = {
  NEW: 'Placed',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  READY: 'Ready',
  DELIVERED: 'Delivered',
};

export default function OrderProgress({ status }: { status: string }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 text-clay text-xs font-semibold mt-3">
        <span className="w-2 h-2 rounded-full bg-clay" />
        Order cancelled
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center mt-3">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step} className={isLast ? 'flex items-center' : 'flex items-center flex-1'}>
            <div className="flex flex-col items-center">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  done ? 'bg-teal-500 text-white' : 'bg-night/10 text-night/30'
                }`}
              >
                {done ? '✓' : ''}
              </span>
              <span className={`text-[9px] mt-1 whitespace-nowrap ${done ? 'text-teal-600 font-semibold' : 'text-night/40'}`}>
                {STEP_LABELS[step]}
              </span>
            </div>
            {!isLast && (
              <span className={`h-0.5 flex-1 mx-1 mb-4 ${i < currentIndex ? 'bg-teal-500' : 'bg-night/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}