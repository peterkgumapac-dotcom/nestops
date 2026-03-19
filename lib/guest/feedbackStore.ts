interface FeedbackState {
  dismissed: boolean
  midStaySubmitted: boolean
  postCheckoutSubmitted: boolean
  rating?: number
}

function key(guidebookId: string) {
  return `nestops_guest_feedback_${guidebookId}`
}

export const feedbackStore = {
  get(guidebookId: string): FeedbackState {
    if (typeof window === 'undefined') return { dismissed: false, midStaySubmitted: false, postCheckoutSubmitted: false }
    try {
      return JSON.parse(localStorage.getItem(key(guidebookId)) ?? 'null') ?? {
        dismissed: false,
        midStaySubmitted: false,
        postCheckoutSubmitted: false,
      }
    } catch {
      return { dismissed: false, midStaySubmitted: false, postCheckoutSubmitted: false }
    }
  },

  set(guidebookId: string, state: Partial<FeedbackState>) {
    const current = feedbackStore.get(guidebookId)
    localStorage.setItem(key(guidebookId), JSON.stringify({ ...current, ...state }))
  },
}
