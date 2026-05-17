"use client";

import { useEffect, useState } from "react";
import { canUserCall } from "@/lib/call-permissions";

interface Props {
  callerId: string;
  receiverId: string;
}

export default function CallPermissionBadge({ callerId, receiverId }: Props) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    canUserCall(callerId, receiverId).then(r => setAllowed(r.allowed));
  }, [callerId, receiverId]);

  if (allowed === null) return null;

  return (
    <p className={`text-xs font-medium ${allowed ? "text-green-600" : "text-gray-400"}`}>
      {allowed
        ? "✓ Calls enabled"
        : "Accept interest to enable calls"}
    </p>
  );
}
