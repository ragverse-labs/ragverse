import { IconCircle, IconCheck } from "@tabler/icons-react";

interface CheckStateProps {
  check: boolean;
}

export default function CheckState(props: CheckStateProps) {
  return (
    <div>
      {props.check ? (
        <IconCircle
          className="text-green-600 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
          aria-hidden="true"
        />
      ) : (
        <IconCheck
          className="text-red-600 flex-shrink-0 -ml-1 mr-3 h-6 w-6"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
