import React, { useState, createContext, useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { account, databases } from "./lib/appwrite";
import { ID } from "appwrite";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateTemplate from "./pages/CreateTemplate";
import HomePage from "./pages/HomePage";
import UserProfilePage from "./pages/UserProfilePage";
import TemplateViewPage from "./pages/TemplateViewPage";
import FillFormPage from "./pages/FillFormPage";
import AdminPage from "./pages/AdminPage";
import BlockedPage from "./pages/BlockedPage";
import NotFoundPage from "./pages/NotFoundPage";
import FilledFormsPage from "./pages/FilledFormsPage";


// Contexts
const AuthContext = createContext();
const LanguageContext = createContext();
const ThemeContext = createContext();

export const useAuth = () => useContext(AuthContext);
export const useLanguage = () => useContext(LanguageContext);
export const useTheme = () => useContext(ThemeContext);

// Translations
const translations = {
  en: {
    login: "Login",
    register: "Register",
    dashboard: "Dashboard",
    templates: "Templates",
    createTemplate: "Create Template",
    dark: "Dark",
    light: "Light",
    english: "English",
    uzbek: "Uzbek",
    russian: "Russian",
    logout: "Logout",
    adminPanel: "Admin Panel",
    home: "Home",
    welcomeToFormBuilder: "Welcome to the Form Builder",
    formBuilderDescription: "Create, share, and analyze custom forms and surveys.",
    browseTemplates: "Browse Templates",
    searchPlaceholder: "Search by title or tag...",
    loading: "Loading...",
    noTemplatesFound: "No templates found.",
    title: "Title",
    topic: "Topic",
    tags: "Tags",
    actions: "Actions",
    details: "Details",
    fill: "Fill",
    signInToAccount: "Sign in to your account",
    email: "Email",
    password: "Password",
    dontHaveAccount: "Don't have an account?",
    name: "Name",
    areYouAdmin: "Are you an admin?",
    adminRequestText: "Yes, I want to be an admin (requires approval)",
    alreadyHaveAccount: "Already have an account?",
    // CreateTemplate page
    description: "Description",
    descriptionMarkdown: "Description (markdown allowed)",
    preview: "Preview",
    makePublic: "Make Public",
    questions: "Questions",
    addQuestion: "+ Add Question",
    saveTemplate: "Save Template",
    removeQuestion: "Remove Question",
    showInTable: "Show in Table",
    optionsCommaSeparated: "Options (comma-separated)",
    order: "Order",
    imageUrlOptional: "Image URL (optional)",
    typeAndPressEnter: "Type and press enter",
    // TemplateViewPage
    likedBy: "Liked by",
    noOneLikedYet: "No one has liked this yet.",
    questions: "Questions",
    noQuestionsAdded: "No questions added to this template.",
    noDescription: "No description",
    type: "Type",
    options: "Options",
    comments: "Comments",
    noCommentsYet: "No comments yet.",
    unknownUser: "Unknown User",
    // FillFormPage
    pleaseLoginToFill: "⚠️ Please log in to fill out the form.",
    failedToLoadTemplate: "Failed to load template.",
    failedToSubmitForm: "Failed to submit form.",
    formAndCommentSubmitted: "✅ Form and comment submitted!",
    yourAnswer: "Your Answer",
    typeYourAnswerHere: "Type your answer here...",
    sendMeCopy: "Send me a copy of my responses",
    yourComment: "Your Comment (optional)",
    leaveYourFeedback: "Leave your feedback...",
    submitForm: "Submit Form",
    select: "Select...",
    // UserProfilePage
    userProfile: "User Profile",
    myProfile: "My Profile",
    viewFilledForms: "View Filled Forms",
    forms: "Forms",
    noTemplatesFound: "No templates found.",
    noFormsFound: "No forms found.",
    visibility: "Visibility",
    public: "Public",
    private: "Private",
    likes: "Likes",
    comments: "Comments",
    filledBy: "Filled by",
    answers: "Answers",
    // AdminPage
    adminPanel: "Admin Panel",
    templatesCreated: "Templates Created",
    allTemplates: "All Templates (Like/Unlike)",
    formsFilled: "Forms Filled",
    commentsLeft: "Comments Left",
    likes: "Likes",
    none: "None",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    unlike: "Unlike",
    like: "Like",
    hide: "Hide",
    details: "Details",
    failedToLoadUsers: "Failed to load users",
    failedToSaveUserChanges: "Failed to save user changes",
    failedToRefreshDetails: "Failed to refresh details",
    failedToLikeTemplate: "Failed to like template",
    failedToUnlikeTemplate: "Failed to unlike template",
    failedToSaveTemplate: "Failed to save template",
    failedToSaveForm: "Failed to save form",
    failedToSaveComment: "Failed to save comment",
    loadingUserDetails: "Loading user details...",
    // FilledFormsPage
    filledForms: "Filled Forms",
    noFilledFormsFound: "No filled forms found.",
    pleaseLoginToView: "Please log in to view your filled forms.",
    template: "Template",
    unknownTemplate: "Unknown Template",
    answer: "Answer",
    noAnswerProvided: "No answer provided",
    openAnswer: "Open Answer",
    unknownQuestion: "Unknown Question",
    // BlockedPage
    accountBlocked: "Account Blocked",
    accountBlockedMessage: "Your account has been blocked by an administrator. If you believe this is a mistake, please contact support.",
    // NotFoundPage
    pageNotFound: "404 - Page Not Found",
    pageNotFoundMessage: "The page you are looking for does not exist.",
    // Common
    confirm: "Confirm",
    close: "Close",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Info",
  },
  uz: {
    login: "Kirish",
    register: "Ro'yxatdan o'tish",
    dashboard: "Boshqaruv paneli",
    templates: "Shablonlar",
    createTemplate: "Shablon yaratish",
    dark: "Qorong'u",
    light: "Yorug'",
    english: "Inglizcha",
    uzbek: "O'zbekcha",
    russian: "Ruscha",
    logout: "Chiqish",
    adminPanel: "Admin Paneli",
    home: "Bosh sahifa",
    welcomeToFormBuilder: "Form Builder'ga xush kelibsiz",
    formBuilderDescription: "Maxsus shakllar va so'rovnomalar yarating, ulashing va tahlil qiling.",
    browseTemplates: "Shablonlarni ko'rish",
    searchPlaceholder: "Sarlavha yoki teglar bo'yicha qidirish...",
    loading: "Yuklanmoqda...",
    noTemplatesFound: "Hech qanday shablon topilmadi.",
    title: "Sarlavha",
    topic: "Mavzu",
    tags: "Teglar",
    actions: "Amallar",
    details: "Tafsilotlar",
    fill: "To'ldirish",
    signInToAccount: "Hisobingizga kiring",
    email: "Elektron pochta",
    password: "Parol",
    dontHaveAccount: "Hisobingiz yo'qmi?",
    name: "Ism",
    areYouAdmin: "Siz adminmisiz?",
    adminRequestText: "Ha, men admin bo'lishni xohlayman (tasdiq talab qilinadi)",
    alreadyHaveAccount: "Hisobingiz bormi?",
    // CreateTemplate page
    description: "Tavsif",
    descriptionMarkdown: "Tavsif (markdown ruxsat berilgan)",
    preview: "Ko'rish",
    makePublic: "Ommaga ochiq qilish",
    questions: "Savollar",
    addQuestion: "+ Savol qo'shish",
    saveTemplate: "Shablonni saqlash",
    removeQuestion: "Savolni olib tashlash",
    showInTable: "Jadvalda ko'rsatish",
    optionsCommaSeparated: "Variantlar (vergul bilan ajratilgan)",
    order: "Tartib",
    imageUrlOptional: "Rasm URL (ixtiyoriy)",
    typeAndPressEnter: "Yozing va Enter bosing",
    // TemplateViewPage
    likedBy: "Yoqtirganlar",
    noOneLikedYet: "Hali hech kim yoqtirmagan.",
    questions: "Savollar",
    noQuestionsAdded: "Bu shablonga savollar qo'shilmagan.",
    noDescription: "Tavsif yo'q",
    type: "Turi",
    options: "Variantlar",
    comments: "Izohlar",
    noCommentsYet: "Hali izohlar yo'q.",
    unknownUser: "Noma'lum foydalanuvchi",
    // FillFormPage
    pleaseLoginToFill: "⚠️ Shaklni to'ldirish uchun tizimga kiring.",
    failedToLoadTemplate: "Shablonni yuklashda xatolik.",
    failedToSubmitForm: "Shaklni yuborishda xatolik.",
    formAndCommentSubmitted: "✅ Shakl va izoh yuborildi!",
    yourAnswer: "Sizning javobingiz",
    typeYourAnswerHere: "Javobingizni bu yerga yozing...",
    sendMeCopy: "Javoblarimning nusxasini menga yuboring",
    yourComment: "Sizning izohingiz (ixtiyoriy)",
    leaveYourFeedback: "O'z fikringizni qoldiring...",
    submitForm: "Shaklni yuborish",
    select: "Tanlang...",
    // UserProfilePage
    userProfile: "Foydalanuvchi profili",
    myProfile: "Mening profilim",
    viewFilledForms: "To'ldirilgan shakllarni ko'rish",
    forms: "Shakllar",
    noTemplatesFound: "Shablonlar topilmadi.",
    noFormsFound: "Shakllar topilmadi.",
    visibility: "Ko'rinish",
    public: "Ommaga ochiq",
    private: "Shaxsiy",
    likes: "Yoqtirishlar",
    comments: "Izohlar",
    filledBy: "To'ldirgan",
    answers: "Javoblar",
    // AdminPage
    adminPanel: "Admin Paneli",
    templatesCreated: "Yaratilgan shablonlar",
    allTemplates: "Barcha shablonlar (Yoqtirish/Yoqtirmaslik)",
    formsFilled: "To'ldirilgan shakllar",
    commentsLeft: "Qoldirilgan izohlar",
    likes: "Yoqtirishlar",
    none: "Yo'q",
    edit: "Tahrirlash",
    save: "Saqlash",
    cancel: "Bekor qilish",
    unlike: "Yoqtirmaslik",
    like: "Yoqtirish",
    hide: "Yashirish",
    details: "Tafsilotlar",
    failedToLoadUsers: "Foydalanuvchilarni yuklashda xatolik",
    failedToSaveUserChanges: "Foydalanuvchi o'zgarishlarini saqlashda xatolik",
    failedToRefreshDetails: "Tafsilotlarni yangilashda xatolik",
    failedToLikeTemplate: "Shablonni yoqtirishda xatolik",
    failedToUnlikeTemplate: "Shablonni yoqtirmaslikda xatolik",
    failedToSaveTemplate: "Shablonni saqlashda xatolik",
    failedToSaveForm: "Shaklni saqlashda xatolik",
    failedToSaveComment: "Izohni saqlashda xatolik",
    loadingUserDetails: "Foydalanuvchi tafsilotlari yuklanmoqda...",
    // FilledFormsPage
    filledForms: "To'ldirilgan shakllar",
    noFilledFormsFound: "To'ldirilgan shakllar topilmadi.",
    pleaseLoginToView: "To'ldirilgan shakllaringizni ko'rish uchun tizimga kiring.",
    template: "Shablon",
    unknownTemplate: "Noma'lum shablon",
    answer: "Javob",
    noAnswerProvided: "Javob berilmagan",
    openAnswer: "Ochiq javob",
    unknownQuestion: "Noma'lum savol",
    // BlockedPage
    accountBlocked: "Hisob bloklangan",
    accountBlockedMessage: "Sizning hisobingiz administrator tomonidan bloklangan. Agar bu xato deb o'ylasangiz, qo'llab-quvvatlash bilan bog'laning.",
    // NotFoundPage
    pageNotFound: "404 - Sahifa topilmadi",
    pageNotFoundMessage: "Siz qidirayotgan sahifa mavjud emas.",
    // Common
    confirm: "Tasdiqlash",
    close: "Yopish",
    error: "Xatolik",
    success: "Muvaffaqiyat",
    warning: "Ogohlantirish",
    info: "Ma'lumot",
  },
  ru: {
    login: "Войти",
    register: "Регистрация",
    dashboard: "Панель",
    templates: "Шаблоны",
    createTemplate: "Создать шаблон",
    dark: "Тёмная",
    light: "Светлая",
    english: "Английский",
    uzbek: "Узбекский",
    russian: "Русский",
    logout: "Выйти",
    adminPanel: "Панель Админа",
    home: "Главная",
    welcomeToFormBuilder: "Добро пожаловать в Form Builder",
    formBuilderDescription: "Создавайте, делитесь и анализируйте пользовательские формы и опросы.",
    browseTemplates: "Просмотр шаблонов",
    searchPlaceholder: "Поиск по названию или тегу...",
    loading: "Загрузка...",
    noTemplatesFound: "Шаблоны не найдены.",
    title: "Название",
    topic: "Тема",
    tags: "Теги",
    actions: "Действия",
    details: "Подробности",
    fill: "Заполнить",
    signInToAccount: "Войдите в свой аккаунт",
    email: "Электронная почта",
    password: "Пароль",
    dontHaveAccount: "Нет аккаунта?",
    name: "Имя",
    areYouAdmin: "Вы администратор?",
    adminRequestText: "Да, я хочу быть администратором (требуется одобрение)",
    alreadyHaveAccount: "Уже есть аккаунт?",
    // CreateTemplate page
    description: "Описание",
    descriptionMarkdown: "Описание (разрешена разметка)",
    preview: "Предварительный просмотр",
    makePublic: "Сделать публичным",
    questions: "Вопросы",
    addQuestion: "+ Добавить вопрос",
    saveTemplate: "Сохранить шаблон",
    removeQuestion: "Удалить вопрос",
    showInTable: "Показать в таблице",
    optionsCommaSeparated: "Варианты (через запятую)",
    order: "Порядок",
    imageUrlOptional: "URL изображения (необязательно)",
    typeAndPressEnter: "Введите и нажмите Enter",
    // TemplateViewPage
    likedBy: "Понравилось",
    noOneLikedYet: "Пока никому не понравилось.",
    questions: "Вопросы",
    noQuestionsAdded: "К этому шаблону не добавлено вопросов.",
    noDescription: "Нет описания",
    type: "Тип",
    options: "Варианты",
    comments: "Комментарии",
    noCommentsYet: "Пока нет комментариев.",
    unknownUser: "Неизвестный пользователь",
    // FillFormPage
    pleaseLoginToFill: "⚠️ Пожалуйста, войдите в систему для заполнения формы.",
    failedToLoadTemplate: "Не удалось загрузить шаблон.",
    failedToSubmitForm: "Не удалось отправить форму.",
    formAndCommentSubmitted: "✅ Форма и комментарий отправлены!",
    yourAnswer: "Ваш ответ",
    typeYourAnswerHere: "Введите ваш ответ здесь...",
    sendMeCopy: "Отправить мне копию моих ответов",
    yourComment: "Ваш комментарий (необязательно)",
    leaveYourFeedback: "Оставьте ваш отзыв...",
    submitForm: "Отправить форму",
    select: "Выберите...",
    // UserProfilePage
    userProfile: "Профиль пользователя",
    myProfile: "Мой профиль",
    viewFilledForms: "Просмотр заполненных форм",
    forms: "Формы",
    noTemplatesFound: "Шаблоны не найдены.",
    noFormsFound: "Формы не найдены.",
    visibility: "Видимость",
    public: "Публичный",
    private: "Приватный",
    likes: "Лайки",
    comments: "Комментарии",
    filledBy: "Заполнено",
    answers: "Ответы",
    // AdminPage
    adminPanel: "Панель администратора",
    templatesCreated: "Созданные шаблоны",
    allTemplates: "Все шаблоны (Лайк/Дизлайк)",
    formsFilled: "Заполненные формы",
    commentsLeft: "Оставленные комментарии",
    likes: "Лайки",
    none: "Нет",
    edit: "Редактировать",
    save: "Сохранить",
    cancel: "Отмена",
    unlike: "Убрать лайк",
    like: "Лайк",
    hide: "Скрыть",
    details: "Подробности",
    failedToLoadUsers: "Не удалось загрузить пользователей",
    failedToSaveUserChanges: "Не удалось сохранить изменения пользователя",
    failedToRefreshDetails: "Не удалось обновить подробности",
    failedToLikeTemplate: "Не удалось поставить лайк шаблону",
    failedToUnlikeTemplate: "Не удалось убрать лайк с шаблона",
    failedToSaveTemplate: "Не удалось сохранить шаблон",
    failedToSaveForm: "Не удалось сохранить форму",
    failedToSaveComment: "Не удалось сохранить комментарий",
    loadingUserDetails: "Загрузка подробностей пользователя...",
    // FilledFormsPage
    filledForms: "Заполненные формы",
    noFilledFormsFound: "Заполненные формы не найдены.",
    pleaseLoginToView: "Пожалуйста, войдите в систему для просмотра заполненных форм.",
    template: "Шаблон",
    unknownTemplate: "Неизвестный шаблон",
    answer: "Ответ",
    noAnswerProvided: "Ответ не предоставлен",
    openAnswer: "Открытый ответ",
    unknownQuestion: "Неизвестный вопрос",
    // BlockedPage
    accountBlocked: "Аккаунт заблокирован",
    accountBlockedMessage: "Ваш аккаунт был заблокирован администратором. Если вы считаете, что это ошибка, пожалуйста, свяжитесь с поддержкой.",
    // NotFoundPage
    pageNotFound: "404 - Страница не найдена",
    pageNotFoundMessage: "Страница, которую вы ищете, не существует.",
    // Common
    confirm: "Подтвердить",
    close: "Закрыть",
    error: "Ошибка",
    success: "Успех",
    warning: "Предупреждение",
    info: "Информация",
  },
};

// Language Provider
function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Auth Provider
function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        console.log("AuthProvider: Attempting to get user account...");
        const user = await account.get();
        const userId = user.$id;
        console.log("AuthProvider: User ID:", userId);

        const dbId = import.meta.env.VITE_APPWRITE_DB_ID;
        const usersCol = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
        
        console.log("AuthProvider: Database ID:", dbId);
        console.log("AuthProvider: Users Collection ID:", usersCol);

        console.log("AuthProvider: Fetching user documents...");
        const res = await databases.listDocuments(dbId, usersCol);
        console.log("AuthProvider: Database response:", res);
        console.log("AuthProvider: Total documents found:", res.documents.length);
        
        const dbUser = res.documents.find((u) => u.authUserId === userId);
        console.log("AuthProvider: Found user in database:", dbUser);

        if (dbUser) {
          console.log("AuthProvider: Setting auth user:", {
            userId,
            name: dbUser.name,
            email: dbUser.email,
            isAdmin: dbUser.isAdmin,
            isBlocked: dbUser.isBlocked,
          });
          
          setAuthUser({
            userId,
            name: dbUser.name,
            email: dbUser.email,
            isAdmin: dbUser.isAdmin,
            isBlocked: dbUser.isBlocked,
          });
        } else {
          console.log("AuthProvider: User not found in database");
          setAuthUser(null);
        }
      } catch (err) {
        console.error("AuthProvider: Error fetching user:", err);
        console.error("AuthProvider: Error message:", err.message);
        console.error("AuthProvider: Error code:", err.code);
        setAuthUser(null);
      }
      setLoading(false);
    }

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Theme Provider
function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply theme to document
    const htmlElement = document.documentElement;
    
    if (isDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    
    // Also apply to body for extra compatibility
    const bodyElement = document.body;
    if (isDark) {
      bodyElement.classList.add('dark');
    } else {
      bodyElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Header
function Header() {
  const { authUser, setAuthUser } = useAuth();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const location = useLocation();

  const isAdmin = authUser?.isAdmin && !authUser?.isBlocked;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await account.deleteSession("current");
      setAuthUser(null);
      window.location.href = "/";
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <header className={`w-full border-b shadow-sm z-50 sticky top-0 transition-colors duration-300 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="text-blue-600 dark:text-blue-400 font-bold text-lg">FormBuilder</Link>
          {isAdmin && (
            <Link to="/admin" className={`${location.pathname === "/admin" ? "underline" : ""} ${
              isDark ? 'text-gray-200 hover:text-gray-100' : 'text-gray-700 hover:text-gray-900'
            }`}>
              {t('adminPanel')}
            </Link>
          )}
          <Link to="/template/create" className={`${location.pathname === "/template/create" ? "underline" : ""} ${
            isDark ? 'text-gray-200 hover:text-gray-100' : 'text-gray-700 hover:text-gray-900'
          }`}>
            {t('createTemplate')}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {/* Enhanced Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md ${
              isDark 
                ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 dark:focus:ring-offset-gray-800' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
            title={isDark ? t('light') : t('dark')}
            aria-label={isDark ? t('light') : t('dark')}
          >
            {isDark ? (
              <svg className="w-5 h-5 text-yellow-500 transition-transform duration-200 hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700 transition-transform duration-200 hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          
          <select
            value={currentLanguage} 
            onChange={(e) => changeLanguage(e.target.value)} 
            className={`px-3 py-1 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-colors shadow-sm ${
              isDark 
                ? 'border-gray-600 bg-gray-800 text-gray-100' 
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          >
            <option value="en">{translations.en.english}</option>
            <option value="uz">{translations.uz.uzbek}</option>
            <option value="ru">{translations.ru.russian}</option>
          </select>
          {authUser ? (
            <>
              <Link
                to="/profile"
                className="text-sm font-semibold hover:underline text-blue-600 dark:text-blue-400 cursor-pointer"
              >
                {authUser.name}
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-red-600 text-sm font-medium"
              >
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`text-sm ${
                isDark ? 'text-gray-200 hover:text-gray-100' : 'text-gray-700 hover:text-gray-900'
              }`}>{t('login')}</Link>
              <Link to="/register" className={`text-sm ${
                isDark ? 'text-gray-200 hover:text-gray-100' : 'text-gray-700 hover:text-gray-900'
              }`}>{t('register')}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// Main App With Auth Loaded
function AppWithAuth() {
  const { loading } = useAuth();
  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/template/create" element={<CreateTemplate />} />
        <Route path="/template/:id" element={<TemplateViewPage />} />
        <Route path="/template/:id/fill" element={<FillFormPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/profile/:userId" element={<UserProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/blocked" element={<BlockedPage />} />
        <Route path="/filled-forms" element={<FilledFormsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

// App Export
export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppWithAuth />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
