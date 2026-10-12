"use client";

import AiChatInput from "./AiChatInput";
import ConfirmTransactionModal from "./ConfirmTransactionModal";
import ReceiptUploadModal from "../layout/ReceiptUploadModal";
import ReceiptPreviewModal from "../layout/ReceiptPreviewModal";
import { useAiChat } from "@/app/hooks/ai-chat/useAiChat";
import { useReceiptUpload } from "@/app/hooks/receipt/useReceiptUpload";

export default function AiChat() {
  const chat = useAiChat();
  const receipt = useReceiptUpload();

  return (
    <>
      <AiChatInput
        message={chat.message}
        onChange={chat.setMessage}
        onSubmit={chat.submit}
        onOpenUpload={receipt.openUpload}
        loading={chat.loading}
        error={chat.error}
      />

      {chat.transactions.length > 0 && (
        <ConfirmTransactionModal
          transactions={chat.transactions}
          categories={chat.categories}
          expandedIndex={chat.expandedIndex}
          saving={chat.saving}
          error={chat.saveError}
          onToggle={chat.toggleExpanded}
          onChange={chat.updateTransaction}
          onDelete={chat.deleteTransaction}
          onCancel={chat.cancel}
          onSave={chat.save}
        />
      )}

      {chat.transactions.length > 0 && (
        <ConfirmTransactionModal
          transactions={chat.transactions}
          categories={chat.categories}
          expandedIndex={chat.expandedIndex}
          saving={chat.saving}
          error={chat.saveError}
          onToggle={chat.toggleExpanded}
          onChange={chat.updateTransaction}
          onDelete={chat.deleteTransaction}
          onCancel={chat.cancel}
          onSave={chat.save}
        />
      )}

      <ReceiptUploadModal
        open={receipt.showUpload}
        onClose={receipt.closeUpload}
        onUpload={receipt.upload}
      />

      {receipt.showPreview && (
        <ReceiptPreviewModal
          result={receipt.receiptResult}
          loading={false}
          error=""
          onClose={receipt.closePreview}
          onSaved={receipt.finishPreview}
        />
      )}
    </>
  );
}
