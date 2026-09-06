export const messages = {
  getMassRejudgeAlert: () => {
    return `Không có submissions nào để Rejudge.`;
  },
  getMassRejudgeConfirm: (...args: unknown[]) => {
    return `Yêu cầu này sẽ Rejudge lại ${args[0]} submission(s). Bạn có chắc chắn không?`;
  },

  toast: {
    rejudging: {
      getOK: () => {
        return "OK Rejudging...";
      },
      getErr: (...args: unknown[]) => {
        return `Cannot rejudge. (${args[0]})`;
      },
    },
  },
};

export const values = {
  refetchDisableDuration: 2000,
};