import { Suspense } from 'react';
import Words from '../../components/Word/Words';

export default function MyWordsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold">শব্দসমূহ লোড হচ্ছে...</div>}>
      <Words />
    </Suspense>
  );
}
