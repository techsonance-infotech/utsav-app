export const translations: Record<string, Record<string, Record<string, string>>> = {
  en: {
    common: {
      welcome: "Welcome",
      login: "Login",
      signup: "Sign Up",
      logout: "Logout",
      send: "Send",
      save: "Save",
      cancel: "Cancel",
      amount: "Amount",
      date: "Date"
    },
    donations: {
      title: "Donations",
      donate_now: "Donate Now",
      receipt: "Donation Receipt"
    },
    expenses: {
      title: "Expenses",
      submit_expense: "Submit Expense",
      category: "Category"
    }
  },
  hi: {
    common: {
      welcome: "स्वागत है",
      login: "लॉगिन",
      signup: "साइन अप",
      logout: "लॉगआउट",
      send: "भेजें",
      save: "सहेजें",
      cancel: "रद्द करें",
      amount: "राशि",
      date: "दिनांक"
    },
    donations: {
      title: "दान",
      donate_now: "अभी दान करें",
      receipt: "दान रसीદ"
    },
    expenses: {
      title: "खर्च",
      submit_expense: "खर्च जमा करें",
      category: "श्रेणी"
    }
  },
  gu: {
    common: {
      welcome: "સ્વાગત છે",
      login: "લોગઇન",
      signup: "સાઇન અપ",
      logout: "લોગઆઉટ",
      send: "મોકલો",
      save: "સાચવો",
      cancel: "રદ કરો",
      amount: "રકમ",
      date: "તારીખ"
    },
    donations: {
      title: "દાન",
      donate_now: "હમણાં જ દાન કરો",
      receipt: "દાનની રસીદ"
    },
    expenses: {
      title: "ખર્ચ",
      submit_expense: "ખર્ચ સબમિટ કરો",
      category: "શ્રેણી"
    }
  }
};

export function t(lang: string, key: string): string {
  const [section, subKey] = key.split(".");
  const dict = translations[lang] || translations.en;
  if (!dict || !dict[section]) return key;
  return dict[section][subKey] || key;
}
