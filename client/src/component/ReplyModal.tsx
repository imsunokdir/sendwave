import React, { useState, forwardRef } from "react";
import {
  Dialog,
  DialogContent,
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  TextField,
  CircularProgress,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import type { EmailType } from "../types/emailType";
import type { TransitionProps } from "@mui/material/transitions";

// Slide transition for the Dialog
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Props = {
  email: EmailType;
  suggestedReply: string;
  onClose: () => void;
};

const ReplyModal = ({ email, suggestedReply, onClose }: Props) => {
  const [replyText, setReplyText] = useState(suggestedReply);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      console.log("Sending reply:", replyText);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onClose();
    } catch (error) {
      console.error("Failed to send reply:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      fullScreen
      open={true}
      onClose={onClose}
      TransitionComponent={Transition} // ✅ slide-up transition
      sx={{
        "& .MuiDialog-paper": {
          background: "linear-gradient(to bottom right, #eff6ff, #faf5ff)",
        },
      }}
    >
      {/* App Bar Header */}
      <AppBar
        sx={{
          position: "relative",
          background: "linear-gradient(to right, #2563eb, #7c3aed)",
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
            Reply to {email.from}
          </Typography>
          <Button
            autoFocus
            color="inherit"
            onClick={handleSend}
            disabled={sending || !replyText.trim()}
            startIcon={
              sending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SendIcon />
              )
            }
          >
            {sending ? "Sending..." : "Send"}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
          {/* Original Email */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "white",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.300",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Sub: {email.subject || "(No Subject)"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              From: {email.from}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {email.snippet}
            </Typography>
          </Box>

          {/* Reply Text Field */}
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "grey.300",
              p: 2,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Your Reply
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={15}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply here..."
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "grey.300" },
                  "&:hover fieldset": { borderColor: "primary.main" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main" },
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ReplyModal;
