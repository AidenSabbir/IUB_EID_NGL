const fs = require('fs');
const path = './components/inbox.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'id: string;',
  'id: string;\n  sender_id: string | null;'
);

content = content.replace(
  'import { Card, CardContent } from "@/components/ui/card";',
  'import { Card, CardContent } from "@/components/ui/card";\nimport { EnvelopeReveal } from "@/components/envelope-reveal";'
);

content = content.replace(
  'const [isUnlocked, setIsUnlocked] = useState(Date.now() >= unlockTime);',
  'const [isUnlocked, setIsUnlocked] = useState(Date.now() >= unlockTime);\n  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);'
);

content = content.replace(
  'const handleEnvelopeClick = (message: Message) => {\n    if (!isUnlocked) return;\n    // Stub for Task 14: Reveal Animation\n    console.log("Reveal message:", message.id);\n  };',
  'const handleEnvelopeClick = (message: Message) => {\n    if (!isUnlocked) return;\n    setSelectedMessage(message);\n  };'
);

const returnStatement = `  if (selectedMessage) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        <EnvelopeReveal
          senderName={selectedMessage.is_anonymous ? "Anonymous" : (selectedMessage.sender_full_name || selectedMessage.sender_username || "Someone")}
          content={selectedMessage.content || ""}
          original_message_id={selectedMessage.id}
          sender_id={selectedMessage.is_anonymous ? null : selectedMessage.sender_id}
          sender_username={selectedMessage.is_anonymous ? null : selectedMessage.sender_username}
          onClose={() => setSelectedMessage(null)}
        />
      </div>
    );
  }

  return (`;

content = content.replace('  return (\n    <div className="space-y-8">', returnStatement + '\n    <div className="space-y-8">');

fs.writeFileSync(path, content);
