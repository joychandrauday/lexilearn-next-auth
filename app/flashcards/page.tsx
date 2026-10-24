import { Suspense } from "react";
import FlashCards from "../../components/Word/FlashCards";
export default function Page() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
            <FlashCards />
        </Suspense>
    );
}
