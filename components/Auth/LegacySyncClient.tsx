'use client';

import { useLegacySync } from '../../lib/hooks/useLegacySync';

export default function LegacySyncClient() {
  useLegacySync();
  return null;
}
