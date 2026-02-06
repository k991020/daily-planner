/// <reference types="vite/client" />
import React, { useState, useEffect, useRef } from "react";
import { 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  Check, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Folder, 
  Briefcase, 
  ShoppingCart, 
  BookOpen, 
  MapPin, 
  Clock,
  CalendarDays,
  ArrowUpDown, 
  Flag,
  Search,
  Edit2,
  Save,
  X,
  Dumbbell,   
  Utensils,   
  Wind,       
  Book,       
  RotateCcw,
  Hash,
  Plane,      
  Music,      
  Video,      
  Code,       
  DollarSign, 
  Coffee,     
  Home,       
  Gamepad2,   
  Gift,       
  Heart,      
  GraduationCap 
} from "lucide-react";

// ----------------------------------------------------------------------
// 1. 타입 및 유틸리티 정의
// ----------------------------------------------------------------------

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
  categoryId?: string;
  dueDate?: Date;
  location?: string;
  time?: string; 
  priority?: boolean;
  tags?: string[];
}

// ----------------------------------------------------------------------
// 1-2. Type Definitions
// ----------------------------------------------------------------------
interface User {
  id: string; // Added UUID for Supabase
  username: string;
  email: string;
}



interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string; 
}

interface Habit {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string; 
  completedDates: string[]; 
}

type SortOption = "manual" | "date_desc" | "date_asc" | "priority_desc" | "priority_asc" | "title_asc" | "title_desc";

// --- 안전한 로컬스토리지 파싱 함수 (에러 방지용) ---
const safeParseJSON = (key: string, fallback: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.error(`Error parsing ${key}`, e);
    return fallback;
  }
};

function ThemeToggle({ isDarkMode, toggleTheme, className = "" }: { isDarkMode: boolean; toggleTheme: () => void; className?: string }) {
  return (
    <div 
      onClick={toggleTheme}
      className={`relative w-16 h-8 rounded-full cursor-pointer transition-colors duration-300 p-1 flex items-center shadow-inner ${
        isDarkMode ? "bg-[#393E46] border border-[#948979]" : "bg-[#F9F8F6] border border-[#D9CFC7]"
      } ${className}`}
    >
      <div className={`absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
        isDarkMode ? "translate-x-8" : "translate-x-0"
      }`}>
        {isDarkMode ? <Moon size={14} className="text-[#393E46]" /> : <Sun size={14} className="text-[#D9CFC7]" />}
      </div>
      <div className="flex justify-between w-full px-1.5 pointer-events-none">
        <Sun size={14} className={`transition-opacity duration-300 ${isDarkMode ? "opacity-50 text-[#948979]" : "opacity-0"}`} />
        <Moon size={14} className={`transition-opacity duration-300 ${isDarkMode ? "opacity-0" : "opacity-50 text-[#948979]"}`} />
      </div>
    </div>
  );
}

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const isSameDay = (date1: Date, date2: Date) => 
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

const formatFullDateTime = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}. ${m}. ${d} ${hh}:${mm}`;
};

const formatDateToInput = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDDayString = (targetDate: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "D-Day";
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
};

const extractTags = (text: string) => {
  const regex = /#[\w가-힣]+/g;
  const tags = text.match(regex) || [];
  const cleanText = text.replace(regex, '').trim();
  return { tags, cleanText };
};

const getSmartIcon = (name: string): React.ReactNode => {
  const n = name.toLowerCase();
  if (n.includes("여행") || n.includes("trip") || n.includes("travel") || n.includes("비행기")) return <Plane size={16} />;
  if (n.includes("공부") || n.includes("study") || n.includes("학교") || n.includes("책")) return <GraduationCap size={16} />;
  if (n.includes("운동") || n.includes("gym") || n.includes("health") || n.includes("헬스")) return <Dumbbell size={16} />;
  if (n.includes("돈") || n.includes("money") || n.includes("금융") || n.includes("bank")) return <DollarSign size={16} />;
  if (n.includes("쇼핑") || n.includes("shop") || n.includes("마트") || n.includes("장보기")) return <ShoppingCart size={16} />;
  if (n.includes("집") || n.includes("home") || n.includes("가족") || n.includes("청소")) return <Home size={16} />;
  if (n.includes("코딩") || n.includes("code") || n.includes("dev") || n.includes("작업")) return <Code size={16} />;
  if (n.includes("음악") || n.includes("music") || n.includes("노래")) return <Music size={16} />;
  if (n.includes("영화") || n.includes("movie") || n.includes("youtube") || n.includes("영상")) return <Video size={16} />;
  if (n.includes("게임") || n.includes("game")) return <Gamepad2 size={16} />;
  if (n.includes("약속") || n.includes("카페") || n.includes("coffee") || n.includes("미팅")) return <Coffee size={16} />;
  if (n.includes("생일") || n.includes("선물") || n.includes("기념일")) return <Gift size={16} />;
  if (n.includes("데이트") || n.includes("연애") || n.includes("사랑")) return <Heart size={16} />;
  if (n.includes("업무") || n.includes("work") || n.includes("직장")) return <Briefcase size={16} />;
  return <Folder size={16} />;
};

const colors = {
  light: {
    bg: "bg-[#F9F8F6]",
    panel: "bg-[#F9F8F6]", 
    accent: "bg-[#C9B59C]", 
    textMain: "text-[#35312C]", 
    textSub: "text-[#888076]", 
    border: "border-[#D9CFC7]", 
    hover: "hover:bg-[#C9B59C]/20", 
    inputBg: "bg-white", 
    popupBg: "bg-white",
    popupText: "text-[#35312C]",
    popupHover: "hover:bg-[#F2F2F2]",
    toastBg: "bg-[#35312C]", 
    toastText: "text-[#F9F8F6]", 
    toastBtn: "text-[#C9B59C]" 
  },
  dark: {
    bg: "bg-[#222831]",
    panel: "bg-[#393E46]",
    accent: "bg-[#948979]",
    textMain: "text-[#F9F8F6]",
    textSub: "text-[#948979]",
    border: "border-[#948979]",
    hover: "hover:bg-[#948979]/30",
    inputBg: "bg-[#222831]",
    popupBg: "bg-[#2C2C2E]",
    popupText: "text-[#E5E5E5]",
    popupHover: "hover:bg-[#3A3A3C]",
    toastBg: "bg-[#E5E5E5]",
    toastText: "text-[#222831]",
    toastBtn: "text-[#D97706]" 
  }
};

// ----------------------------------------------------------------------
// 2. TodoList Component
// ----------------------------------------------------------------------
function TodoList({ user, onLogout, isDarkMode, toggleTheme }: { user: User; onLogout: () => void; isDarkMode: boolean; toggleTheme: () => void }) {
  const [todos, setTodos] = useState<Todo[]>([]);

  const [categories, setCategories] = useState<Category[]>(() => {
    const parsed = safeParseJSON(`my_scheduler_categories_${user.email}`, []);
    if (parsed.length > 0) {
      return parsed.map((c: any) => ({
        ...c,
        icon: c.id === 'personal' ? <UserIcon size={16}/> : 
              c.id === 'work' ? <Briefcase size={16}/> : 
              c.id === 'shopping' ? <ShoppingCart size={16}/> : 
              getSmartIcon(c.name)
      }));
    }
    return [
      { id: "personal", name: "개인", icon: <UserIcon size={16}/>, color: "#10B981" },
      { id: "work", name: "업무", icon: <Briefcase size={16}/>, color: "#3B82F6" },
      { id: "shopping", name: "쇼핑", icon: <ShoppingCart size={16}/>, color: "#F59E0B" },
    ];
  });

  const [habits, setHabits] = useState<Habit[]>(() => [
    { id: "exercise", name: "운동", icon: <Dumbbell size={20}/>, color: "#EF4444", completedDates: [] },
    { id: "diet", name: "식단", icon: <Utensils size={20}/>, color: "#10B981", completedDates: [] },
    { id: "running", name: "러닝", icon: <Wind size={20}/>, color: "#3B82F6", completedDates: [] },
    { id: "diary", name: "일기", icon: <Book size={20}/>, color: "#F59E0B", completedDates: [] },
    { id: "reading", name: "독서", icon: <BookOpen size={20}/>, color: "#A855F7", completedDates: [] },
  ]);

  const [deletedTodo, setDeletedTodo] = useState<{ item: Todo, index: number } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Todos
      const { data: todosData, error: todosError } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (todosError) console.error('Error fetching todos:', todosError);
      else if (todosData) {
        setTodos(todosData.map((t: any) => ({
          id: t.id,
          text: t.text,
          completed: t.completed,
          createdAt: new Date(t.created_at),
          categoryId: t.category_id,
          dueDate: t.due_date ? new Date(t.due_date) : undefined,
          location: t.location,
          time: t.time,
          priority: t.priority,
          tags: t.tags
        })));
      }

      // 2. Fetch Habit Completions
      const { data: habitsData, error: habitsError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id);
        
      if (habitsError) console.error('Error fetching habits:', habitsError);
      else if (habitsData) {
        setHabits(prev => prev.map(h => ({
           ...h,
           completedDates: habitsData.filter((d: any) => d.habit_id === h.id).map((d: any) => d.completed_date)
        })));
      }
    };

    fetchData();
  }, [user.id]);

  const [inputValue, setInputValue] = useState("");
  const [inputLocation, setInputLocation] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [isTimeEnabled, setIsTimeEnabled] = useState(false);
  const [timeAmpm, setTimeAmpm] = useState<"오전" | "오후">("오전");
  const [timeHour, setTimeHour] = useState<string>("00");
  const [timeMinute, setTimeMinute] = useState<string>("00");
  const [activeTimeDropdown, setActiveTimeDropdown] = useState<"ampm" | "hour" | "minute" | null>(null);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [inputDate, setInputDate] = useState<Date>(new Date());
  const [pickerDate, setPickerDate] = useState(new Date()); 
  const [sidebarSelectedDate, setSidebarSelectedDate] = useState<Date | null>(new Date());

  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [sortOption, setSortOption] = useState<SortOption>("manual");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const theme = isDarkMode ? colors.dark : colors.light;
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  const currentHabitDate = sidebarSelectedDate ? formatDateToInput(sidebarSelectedDate) : formatDateToInput(today);
  const allTags = Array.from(new Set(todos.flatMap(todo => todo.tags || [])));

  const pickerYear = pickerDate.getFullYear();
  const pickerMonth = pickerDate.getMonth();
  const pickerDaysInMonth = getDaysInMonth(pickerYear, pickerMonth);
  const pickerFirstDay = getFirstDayOfMonth(pickerYear, pickerMonth);

  const timeWrapperRef = useRef<HTMLDivElement>(null);
  const calendarHeaderRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (timeWrapperRef.current && !timeWrapperRef.current.contains(event.target as Node)) setActiveTimeDropdown(null);
      if (calendarHeaderRef.current && !calendarHeaderRef.current.contains(event.target as Node)) {
        setShowYearPicker(false);
        setShowMonthPicker(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) setShowSortMenu(false);
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) setShowDatePicker(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  // Smart Parsing Logic
  const parseSmartInput = (input: string) => {
    let text = input;
    let timeString = undefined;
    let location = undefined;

    // 1. Time Parsing
    // Match "오전/오후 XX시 YY분" or "오전/오후 XX시"
    const ampmRegex = /(오전|오후)\s*(\d{1,2})시(\s*(\d{1,2})분)?/;
    // Match "XX시 YY분" or "XX시"
    const simpleTimeRegex = /(\d{1,2})시(\s*(\d{1,2})분)?/;

    let timeMatch = text.match(ampmRegex);
    if (timeMatch) {
      const period = timeMatch[1];
      let hour = parseInt(timeMatch[2]);
      const minute = timeMatch[4] ? parseInt(timeMatch[4]) : 0;
      
      // Normalize to 12-hour format for display
      const displayHour = hour; // Already 12-h format if user typed 오전/오후
      // Only check validity
      if (hour >= 1 && hour <= 12 && minute >= 0 && minute < 60) {
          timeString = `${period} ${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          text = text.replace(timeMatch[0], "").trim();
      }
    } else {
      timeMatch = text.match(simpleTimeRegex);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const minute = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
        
        if (hour >= 0 && hour <= 24 && minute >= 0 && minute < 60) {
            const ampm = hour >= 12 ? "오후" : "오전";
            const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
            timeString = `${ampm} ${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            text = text.replace(timeMatch[0], "").trim();
        }
      }
    }

    // 2. Location Parsing ("~에서")
    const locationRegex = /([가-힣a-zA-Z0-9]+)에서/;
    const locMatch = text.match(locationRegex);
    if (locMatch) {
      location = locMatch[1];
      text = text.replace(locMatch[0], "").trim();
    }

    return { cleanText: text, time: timeString, location };
  };

  const addTodo = async () => {
    if (inputValue.trim() === "") return alert("할 일을 입력해 주세요!");
    
    // Apply Smart Parsing
    const parsed = parseSmartInput(inputValue);
    const { tags, cleanText } = extractTags(parsed.cleanText); 
    
    const finalTime = parsed.time || (isTimeEnabled ? `${timeAmpm} ${timeHour}:${timeMinute}` : undefined);
    const finalLocation = parsed.location || (inputLocation.trim() || undefined);

    const newTodoPayload = {
      user_id: user.id,
      text: cleanText || parsed.cleanText,
      completed: false,
      created_at: new Date().toISOString(),
      category_id: selectedCategoryId === "all" ? undefined : selectedCategoryId,
      due_date: inputDate ? inputDate.toISOString() : null,
      location: finalLocation,
      time: finalTime,
      priority: false,
      tags: tags
    };

    const { data, error } = await supabase.from('schedules').insert(newTodoPayload).select().single();

    if (error) {
       console.error('Error adding todo:', error);
       alert('일정 추가 실패');
       return;
    }

    const newTodo: Todo = {
      id: data.id,
      text: data.text,
      completed: data.completed,
      createdAt: new Date(data.created_at),
      categoryId: data.category_id,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      location: data.location,
      time: data.time,
      priority: data.priority,
      tags: data.tags
    };

    setTodos([newTodo, ...todos]);
    setInputValue("");
    setInputLocation("");
    setIsTimeEnabled(false);
    setTimeAmpm("오전");
    setTimeHour("00");
    setTimeMinute("00");
    setActiveTimeDropdown(null);
  };

  const startEditing = (id: number, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = async (id: number) => {
    if (editText.trim() === "") return;
    const { tags, cleanText } = extractTags(editText);
    
    const { error } = await supabase.from('schedules').update({
        text: cleanText || editText,
        tags: tags
    }).eq('id', id);

    if (error) {
        console.error('Error updating todo:', error);
        return;
    }

    setTodos(todos.map(t => t.id === id ? { ...t, text: cleanText || editText, tags: tags } : t));
    setEditingId(null);
    setEditText("");
  };

  const addCategory = () => {
    if (newCategoryName.trim() === "") return;
    const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 70%)`;
    const smartIcon = getSmartIcon(newCategoryName);
    setCategories([...categories, { 
      id: Date.now().toString(), 
      name: newCategoryName.trim(), 
      icon: smartIcon,
      color: randomColor 
    }]);
    setNewCategoryName("");
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (["personal", "work", "shopping"].includes(catId)) return alert("기본 카테고리는 삭제할 수 없습니다.");
    if (window.confirm(`'${catName}' 카테고리를 정말 삭제하시겠습니까?`)) {
      setCategories(prev => prev.filter(c => c.id !== catId));
      
      // Optimistic update for todos
      setTodos(prevTodos => prevTodos.map(todo => todo.categoryId === catId ? { ...todo, categoryId: undefined } : todo));
      if (selectedCategoryId === catId) setSelectedCategoryId("all");

      // Update Supabase to clear category reference
      const { error } = await supabase.from('schedules')
        .update({ category_id: null })
        .eq('user_id', user.id)
        .eq('category_id', catId);
        
      if (error) {
        console.error("Error clearing category from todos:", error);
        // We technically should revert, but for a category delete, it's rare to fail. 
        // Just logging it is acceptable for now.
      }
    }
  };

  const clearAllTodos = () => {
    if (todos.length === 0) return;
    if (window.confirm("메모를 전부 지우시겠습니까?")) setTodos([]);
  };

  const toggleTodo = async (id: number) => {
     const todo = todos.find(t => t.id === id);
     if (!todo) return;

     // Optimistic Update
     const previousTodos = [...todos];
     setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

     const { error } = await supabase.from('schedules').update({ completed: !todo.completed }).eq('id', id);
     
     if (error) {
       console.error('Error toggling:', error);
       setTodos(previousTodos); // Revert on error
       alert("상태 업데이트 실패");
     }
  };
  
  const deleteTodo = async (id: number) => {
    const todoToDelete = todos.find(t => t.id === id);
    const index = todos.findIndex(t => t.id === id);
    if (todoToDelete) {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) {
        console.error('Error deleting:', error);
        return;
      }

      setDeletedTodo({ item: todoToDelete, index });
      setTodos(todos.filter(t => t.id !== id));
      setShowToast(true);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
        setDeletedTodo(null);
      }, 6000); 
    }
  };

  const undoDelete = async () => {
    if (deletedTodo) {
      const item = deletedTodo.item;
      // Re-insert to DB (New ID generated)
      const newPayload = {
          user_id: user.id,
          text: item.text,
          completed: item.completed,
          created_at: item.createdAt.toISOString(),
          category_id: item.categoryId,
          due_date: item.dueDate ? item.dueDate.toISOString() : null,
          location: item.location,
          time: item.time,
          priority: item.priority,
          tags: item.tags
      };

      const { data, error } = await supabase.from('schedules').insert(newPayload).select().single();
      
      if (error) {
          console.error('Error undoing delete:', error);
          alert('되돌리기 실패');
          return;
      }

      const restoredTodo = { ...item, id: data.id }; // Use new ID from DB

      const newTodos = [...todos];
      newTodos.splice(deletedTodo.index, 0, restoredTodo);
      setTodos(newTodos);
      setShowToast(false);
      setDeletedTodo(null);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    }
  };

  const togglePriority = (id: number) => setTodos(todos.map(t => t.id === id ? { ...t, priority: !t.priority } : t));
  const clearCompleted = () => setTodos(todos.filter(t => !t.completed));

  const toggleHabit = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(currentHabitDate);
    const previousHabits = [...habits];

    // Optimistic Update
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        return {
          ...h,
          completedDates: isCompleted 
            ? h.completedDates.filter(d => d !== currentHabitDate) 
            : [...h.completedDates, currentHabitDate]
        };
      }
      return h;
    }));
    
    // Background DB Update
    let error;
    if (isCompleted) {
        const { error: delError } = await supabase.from('habit_completions')
          .delete()
          .eq('user_id', user.id)
          .eq('habit_id', habitId)
          .eq('completed_date', currentHabitDate);
        error = delError;
    } else {
        const { error: insError } = await supabase.from('habit_completions').insert({
            user_id: user.id,
            habit_id: habitId,
            completed_date: currentHabitDate
        });
        error = insError;
    }

    if (error) {
      console.error('Error toggling habit:', error);
      setHabits(previousHabits); // Revert
      alert('습관 업데이트 실패');
    }
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    setSidebarSelectedDate(now);
  };

  const prevPickerMonth = () => setPickerDate(new Date(pickerYear, pickerMonth - 1, 1));
  const nextPickerMonth = () => setPickerDate(new Date(pickerYear, pickerMonth + 1, 1));

  const filteredAndSortedTodos = [...todos]
    .filter((todo) => {
      if (selectedCategoryId !== "all" && todo.categoryId !== selectedCategoryId) return false;
      if (filter === "active") return !todo.completed;
      if (filter === "completed") return todo.completed;
      if (selectedTag && (!todo.tags || !todo.tags.includes(selectedTag))) return false;
      if (searchQuery && !todo.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "date_desc": return b.createdAt.getTime() - a.createdAt.getTime();
        case "date_asc": return a.createdAt.getTime() - b.createdAt.getTime();
        case "priority_desc": return (b.priority ? 1 : 0) - (a.priority ? 1 : 0);
        case "priority_asc": return (a.priority ? 1 : 0) - (b.priority ? 1 : 0);
        case "title_asc": return a.text.localeCompare(b.text);
        case "title_desc": return b.text.localeCompare(a.text);
        default: return 0;
      }
    });

  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const hoursList = ["00", ...Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))];
  const minutesList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const currentCategoryName = selectedCategoryId === "all" ? "전체 보기" : categories.find(c => c.id === selectedCategoryId)?.name || "목록";
  const completedTodosCount = todos.filter(t => t.completed).length;
  const isOverlayVisible = showDatePicker || activeTimeDropdown !== null;

  return (
    <div className={`flex flex-col h-[100dvh] w-full ${theme.bg} ${theme.textMain} transition-colors duration-300 font-sans overflow-hidden`}>
      {isOverlayVisible && (
        <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px] transition-all duration-300 pointer-events-none" />
      )}

      {/* Undo Toast */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className={`${theme.toastBg} ${theme.toastText} px-6 py-3 rounded-full shadow-lg flex items-center gap-4`}>
          <span className="text-sm font-medium">할 일이 삭제되었습니다.</span>
          <button onClick={undoDelete} className={`flex items-center gap-1 text-sm font-bold hover:opacity-80 transition-opacity ${theme.toastBtn}`}>
            <RotateCcw size={14} /> 실행 취소
          </button>
        </div>
      </div>

      <header className={`sticky top-0 z-50 border-b backdrop-blur-lg transition-colors duration-300 ${isDarkMode ? "bg-[#222831]/90 border-[#393E46]" : "bg-[#F9F8F6]/80 border-[#D9CFC7]"}`}>
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${theme.accent} ${isDarkMode ? 'text-white' : 'text-[#393E46]'}`}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className={`font-semibold ${theme.textMain}`}>{user.username}님</p>
              <p className={`text-xs ${theme.textSub} hidden md:block`}>{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isDarkMode ? "bg-[#2C2C2E] border-[#393E46]" : "bg-white border-[#D9CFC7]"}`}>
              <Search size={16} className={theme.textSub} />
              <input 
                type="text" 
                placeholder="검색..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`bg-transparent outline-none text-sm w-32 ${theme.textMain}`} 
              />
              {searchQuery && <button onClick={() => setSearchQuery("")}><X size={14} className={theme.textSub}/></button>}
            </div>

            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            <button onClick={onLogout} className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${isDarkMode ? "border-[#948979] text-[#948979] hover:bg-[#948979] hover:text-white" : "border-[#D9CFC7] text-[#5c5c5c] hover:bg-[#D9CFC7] hover:text-[#222831]"}`}>
              <LogOut size={16} /> <span className="hidden md:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`w-72 flex flex-col hidden md:flex border-r transition-colors duration-300 ${theme.panel} ${isDarkMode ? 'border-[#222831]' : 'border-[#D9CFC7]'}`}>
          <div className="p-4 flex-1 overflow-y-auto">
            <h2 className={`text-xs font-semibold uppercase mb-2 px-2 ${theme.textSub}`}>카테고리</h2>
            <ul className="space-y-1 mb-6">
              <li>
                <button onClick={() => setSelectedCategoryId("all")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedCategoryId === "all" ? `${theme.accent} ${isDarkMode ? 'text-white' : 'text-[#393E46]'}` : `${theme.textMain} ${theme.hover}`}`}>
                  <BookOpen size={18} /> 전체 보기
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isDarkMode ? "bg-[#222831] text-[#948979]" : "bg-white text-[#5c5c5c]"}`}>{todos.length}</span>
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button onClick={() => setSelectedCategoryId(cat.id)} onContextMenu={(e) => { e.preventDefault(); handleDeleteCategory(cat.id, cat.name); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative ${selectedCategoryId === cat.id ? `${theme.accent} ${isDarkMode ? 'text-white' : 'text-[#393E46]'}` : `${theme.textMain} ${theme.hover}`}`}>
                    <div className={`${selectedCategoryId === cat.id ? '' : theme.textSub}`}>
                      {cat.icon}
                    </div>
                    {cat.name}
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isDarkMode ? "bg-[#222831] text-[#948979]" : "bg-white text-[#5c5c5c]"}`}>{todos.filter(t => t.categoryId === cat.id).length}</span>
                  </button>
                </li>
              ))}
            </ul>
            {isAddingCategory ? (
              <div className="mb-6 px-2">
                <input type="text" placeholder="새 카테고리 이름" autoFocus value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onBlur={() => !newCategoryName && setIsAddingCategory(false)} onKeyPress={(e) => e.key === "Enter" && addCategory()} className={`w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#948979]/50 ${isDarkMode ? "bg-[#222831] text-white" : "bg-white text-[#393E46]"}`} />
              </div>
            ) : (
              <button onClick={() => setIsAddingCategory(true)} className={`mb-6 w-full flex items-center gap-2 text-sm px-3 py-2 transition-colors rounded-lg ${isDarkMode ? "text-[#948979] hover:bg-[#222831]" : "text-[#5c5c5c] hover:bg-[#D9CFC7]/30"}`}>
                <Plus size={16} /> 새 카테고리 추가
              </button>
            )}

            <div className={`border-t pt-4 ${isDarkMode ? 'border-[#222831]' : 'border-[#D9CFC7]'}`}>
              <div className="flex items-center justify-between mb-3 px-2">
                <h2 className={`text-xs font-semibold uppercase ${theme.textSub}`}>캘린더</h2>
                <div className="flex gap-1">
                  <button onClick={prevMonth} className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${theme.hover}`}><ChevronLeft size={16} /></button>
                  <button onClick={goToToday} className={`text-xs font-medium hover:underline px-2 ${theme.textSub}`}>오늘</button>
                  <button onClick={nextMonth} className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${theme.hover}`}><ChevronRight size={16} /></button>
                </div>
              </div>
              <div className="text-center mb-3 relative flex items-center justify-center gap-1" ref={calendarHeaderRef}>
                <button onClick={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }} className={`text-sm font-semibold px-2 py-1 rounded-lg transition-colors ${theme.hover} ${showYearPicker ? theme.accent : ''}`}>{year}년</button>
                <button onClick={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }} className={`text-sm font-semibold px-2 py-1 rounded-lg transition-colors ${theme.hover} ${showMonthPicker ? theme.accent : ''}`}>{monthNames[month]}</button>
                {showYearPicker && (
                  <div className={`absolute top-full mt-1 z-20 w-48 max-h-60 overflow-y-auto rounded-xl shadow-xl border p-2 grid grid-cols-3 gap-1 ${isDarkMode ? "bg-[#2C2C2E] border-[#393E46]" : "bg-white border-[#D9CFC7]"}`}>
                    {Array.from({ length: 20 }, (_, i) => year - 10 + i).map((y) => (
                      <button key={y} onClick={() => { setCurrentMonth(new Date(y, month, 1)); setShowYearPicker(false); }} className={`text-xs py-2 rounded-lg ${y === year ? `${theme.accent} font-bold` : `${theme.popupText} ${theme.popupHover}`}`}>{y}</button>
                    ))}
                  </div>
                )}
                {showMonthPicker && (
                  <div className={`absolute top-full mt-1 z-20 w-48 rounded-xl shadow-xl border p-2 grid grid-cols-3 gap-1 ${isDarkMode ? "bg-[#2C2C2E] border-[#393E46]" : "bg-white border-[#D9CFC7]"}`}>
                    {monthNames.map((m, idx) => (
                      <button key={m} onClick={() => { setCurrentMonth(new Date(year, idx, 1)); setShowMonthPicker(false); }} className={`text-xs py-2 rounded-lg ${idx === month ? `${theme.accent} font-bold` : `${theme.popupText} ${theme.popupHover}`}`}>{m}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-1">
                <div className="grid grid-cols-7 mb-1">
                  {weekDays.map((day, idx) => <div key={day} className={`text-[10px] font-medium text-center py-1 ${idx === 0 ? "text-[#FF453A]" : idx === 6 ? "text-[#0071e3]" : theme.textSub}`}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: firstDay }).map((_, idx) => <div key={`empty-${idx}`} className="aspect-square" />)}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const date = new Date(year, month, day);
                    const dateString = formatDateToInput(date);
                    const isToday = isSameDay(date, today);
                    const isSelected = sidebarSelectedDate && isSameDay(date, sidebarSelectedDate);
                    
                    const completedHabitsForDay = habits.filter(h => h.completedDates.includes(dateString));

                    return (
                      <button key={day} onClick={() => setSidebarSelectedDate(date)} className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all relative ${isSelected ? `${theme.accent} ${isDarkMode ? 'text-white' : 'text-[#393E46]'} font-bold shadow-sm` : isToday ? `border border-[#948979] ${theme.textMain}` : `${theme.textMain} hover:opacity-70`}`}>
                        <span className="mb-0.5">{day}</span>
                        {/* 습관 점 표시 */}
                        <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[1.2rem]">
                          {completedHabitsForDay.map(h => (
                            <div key={h.id} className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Tag Cloud Area */}
              {allTags.length > 0 && (
                <div className="mt-6 px-2">
                  <h2 className={`text-xs font-semibold uppercase mb-2 ${theme.textSub}`}>태그</h2>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <button 
                        key={tag} 
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={`text-[10px] px-2 py-1 rounded-full transition-all border flex items-center gap-1 ${
                          selectedTag === tag 
                            ? `${theme.accent} ${isDarkMode ? 'text-white border-transparent' : 'text-[#393E46] border-transparent'}` 
                            : `bg-transparent border-gray-400/30 ${theme.textMain} hover:border-gray-400`
                        }`}
                      >
                        <Hash size={10} /> {tag.replace('#', '')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto ${theme.bg}`}>
          <div className="max-w-3xl mx-auto p-4 md:px-6 md:py-10">
            <div className="mb-8">
              <h1 className={`text-3xl font-bold flex items-center gap-2 ${theme.textMain}`}>
                <div className="hidden md:flex items-center gap-2">
                  {selectedCategoryId === "all" ? <BookOpen className={isDarkMode ? "text-[#948979]" : "text-[#D9CFC7]"} /> : categories.find(c => c.id === selectedCategoryId)?.icon}
                  <span className="ml-2">{currentCategoryName}</span>
                  {selectedTag && <span className="text-sm font-normal opacity-60 ml-2">#{selectedTag.replace('#','')}</span>}
                </div>
                
                {/* Mobile Mini Calendar (Static) - Full Width */}
                <div className="md:hidden w-full p-4 border rounded-2xl shadow-sm bg-card/60 backdrop-blur-sm">
                  <div className="text-sm font-bold mb-2 text-center leading-none">{monthNames[month]}</div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {weekDays.map(d => <div key={d} className="text-[10px] opacity-50 font-medium">{d}</div>)}
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                       const d = i + 1;
                       const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                       const isSelected = sidebarSelectedDate && d === sidebarSelectedDate.getDate() && month === sidebarSelectedDate.getMonth() && year === sidebarSelectedDate.getFullYear();
                       return (
                         <div key={d} className={`text-[11px] h-6 w-6 flex items-center justify-center rounded-full mx-auto ${isSelected ? theme.accent + ' text-white font-bold' : isToday ? 'bg-gray-200/80 text-black font-semibold' : ''}`}>
                           {d}
                         </div>
                       );
                    })}
                  </div>
                </div>
              </h1>
              <p className={`mt-6 md:mt-2 ${theme.textSub}`}>
                {sidebarSelectedDate ? `${sidebarSelectedDate.getMonth()+1}월 ${sidebarSelectedDate.getDate()}일` : '오늘'}의 습관을 체크해보세요
              </p>

              {/* Habit Tracker Buttons */}
              <div className="grid grid-cols-5 gap-2 mt-6 w-full">
                {habits.map((habit) => {
                  const isCompleted = habit.completedDates.includes(currentHabitDate);
                  return (
                    <button 
                      key={habit.id} 
                      onClick={() => toggleHabit(habit.id)}
                      className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-2xl transition-all duration-300 w-full border min-h-[80px]
                        ${isCompleted 
                          ? `${theme.accent} ${isDarkMode ? 'text-white' : 'text-[#393E46]'} shadow-md border-transparent` 
                          : `${theme.panel} ${theme.textMain} hover:opacity-80 ${theme.border}`
                        }`}
                    >
                      <div className={`p-1.5 rounded-full ${isCompleted ? 'bg-white/20' : 'bg-black/5'}`}>
                        {habit.icon}
                      </div>
                      <span className="text-[10px] md:text-xs font-semibold whitespace-nowrap">{habit.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`rounded-2xl shadow-lg p-5 mb-6 transition-colors duration-300 ${theme.panel} border ${theme.border} flex flex-col gap-3 relative z-50`}>
              <textarea 
                placeholder="할 일을 입력하세요... (#태그 사용 가능)" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing) return;
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addTodo();
                  }
                }}
                rows={2}
                className={`w-full rounded-xl p-4 text-base outline-none transition-all resize-none ${isDarkMode ? "bg-[#222831] text-white placeholder-gray-500 focus:ring-1 focus:ring-[#948979]" : "bg-[#F9F8F6] text-[#393E46] placeholder-[#9CA3AF] focus:ring-1 focus:ring-[#D9CFC7]"}`} 
              />
              <div className="flex flex-col md:flex-row gap-3">
                <div className={`w-full md:flex-1 flex items-center gap-2 rounded-xl px-4 py-3 transition-all ${isDarkMode ? "bg-[#222831]" : "bg-[#F9F8F6]"}`}>
                  <MapPin size={18} className={theme.textSub} />
                  <input type="text" placeholder="위치 (선택)" value={inputLocation} onChange={(e) => setInputLocation(e.target.value)} className={`w-full bg-transparent outline-none text-sm ${theme.textMain} placeholder-gray-500`} />
                </div>
                
                <div ref={timeWrapperRef} className={`w-full md:flex-[1.8] flex items-center gap-2 rounded-xl px-4 py-3 transition-all relative ${isDarkMode ? "bg-[#222831]" : "bg-[#F9F8F6]"}`}>
                  <div onClick={() => setIsTimeEnabled(!isTimeEnabled)} className={`w-4 h-4 rounded flex items-center justify-center border cursor-pointer transition-all shrink-0 ${isTimeEnabled ? theme.accent + " border-transparent" : "border-gray-400"}`}>
                    {isTimeEnabled && <Check size={12} className={isDarkMode ? "text-white" : "text-[#393E46]"} />}
                  </div>

                  <div className={`flex items-center flex-1 gap-2 transition-opacity duration-200 overflow-x-auto ${isTimeEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                    <div className="relative shrink-0" ref={datePickerRef}>
                      <div 
                        className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer hover:bg-black/5 transition-colors ${theme.textMain}`}
                        onClick={() => isTimeEnabled && setShowDatePicker(!showDatePicker)}
                      >
                        <CalendarDays size={16} className={theme.textSub} />
                        <span className="text-sm font-medium whitespace-nowrap">
                          {inputDate ? `${inputDate.getMonth()+1}/${inputDate.getDate()}` : "날짜"}
                        </span>
                      </div>
                      {showDatePicker && isTimeEnabled && (
                        <div className={`absolute top-full left-0 mt-2 w-64 rounded-xl shadow-2xl border p-4 z-50 ${isDarkMode ? "bg-[#2C2C2E] border-[#393E46]" : "bg-white border-[#D9CFC7]"}`}>
                          <div className="flex items-center justify-between mb-4">
                            <button onClick={prevPickerMonth} className={`p-1 rounded hover:bg-black/10`}><ChevronLeft size={16}/></button>
                            <span className={`font-bold ${theme.textMain}`}>{pickerYear}년 {pickerMonth + 1}월</span>
                            <button onClick={nextPickerMonth} className={`p-1 rounded hover:bg-black/10`}><ChevronRight size={16}/></button>
                          </div>
                          <div className="grid grid-cols-7 mb-2">
                            {weekDays.map(d => <div key={d} className={`text-center text-[10px] ${theme.textSub}`}>{d}</div>)}
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {Array.from({length: pickerFirstDay}).map((_, i) => <div key={`empty-${i}`} />)}
                            {Array.from({length: pickerDaysInMonth}).map((_, i) => {
                              const d = i + 1;
                              const date = new Date(pickerYear, pickerMonth, d);
                              const isSel = inputDate && isSameDay(date, inputDate);
                              return (
                                <button 
                                  key={d} 
                                  onClick={() => { setInputDate(date); setShowDatePicker(false); }}
                                  className={`w-8 h-8 rounded-full text-xs flex items-center justify-center transition-all ${isSel ? theme.accent + (isDarkMode ? " text-white" : " text-[#393E46]") : theme.textMain + " hover:bg-black/5"}`}
                                >
                                  {d}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1 shrink-0"></div>

                    <Clock size={18} className={`${theme.textSub} shrink-0`} />
                    <div className={`flex items-center gap-1 text-sm ${theme.textMain} whitespace-nowrap`}>
                      <div className="relative">
                        <span onClick={() => setActiveTimeDropdown(activeTimeDropdown === 'ampm' ? null : 'ampm')} className={`hover:bg-black/10 px-1 rounded transition-colors cursor-pointer ${activeTimeDropdown === 'ampm' ? 'bg-[#948979] text-white' : ''}`}>{timeAmpm}</span>
                        {isTimeEnabled && activeTimeDropdown === 'ampm' && (
                          <div className={`absolute top-full left-0 mt-1 w-20 rounded-xl shadow-xl border overflow-hidden z-50 ${isDarkMode ? "bg-[#2C2C2E] border-[#393E46]" : "bg-white border-[#D9CFC7]"}`}>
                            {["오전", "오후"].map((item) => <div key={item} onClick={() => { setTimeAmpm(item as "오전"|"오후"); setActiveTimeDropdown(null); }} className={`px-4 py-2 text-sm cursor-pointer ${theme.popupText} ${theme.popupHover} ${timeAmpm === item ? theme.accent : ''}`}>{item}</div>)}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <span onClick={() => setActiveTimeDropdown(activeTimeDropdown === 'hour' ? null : 'hour')} className={`hover:bg-black/10 px-1 rounded transition-colors cursor-pointer ${activeTimeDropdown === 'hour' ? 'bg-[#0071e3] text-white' : ''}`}>{timeHour}</span>
                        {isTimeEnabled && activeTimeDropdown === 'hour' && (
                          <div className={`absolute top-full left-0 mt-1 w-16 max-h-48 overflow-y-auto rounded-xl shadow-xl border z-50 ${isDarkMode ? "bg-[#2C2C2E] border-[#393E46]" : "bg-white border-[#D9CFC7]"}`}>
                            {hoursList.map((h) => <div key={h} onClick={() => { setTimeHour(h); setActiveTimeDropdown(null); }} className={`px-2 py-2 text-sm cursor-pointer text-center ${theme.popupText} ${theme.popupHover} ${timeHour === h ? theme.accent : ''}`}>{h}</div>)}
                          </div>
                        )}
                      </div>
                      :
                      <div className="relative">
                        <span onClick={() => setActiveTimeDropdown(activeTimeDropdown === 'minute' ? null : 'minute')} className={`hover:bg-black/10 px-1 rounded transition-colors cursor-pointer ${activeTimeDropdown === 'minute' ? 'bg-[#0071e3] text-white' : ''}`}>{timeMinute}</span>
                        {isTimeEnabled && activeTimeDropdown === 'minute' && (
                          <div className={`absolute top-full left-0 mt-1 w-16 max-h-48 overflow-y-auto rounded-xl shadow-xl border z-50 ${isDarkMode ? "bg-[#2C2C2E] border-[#393E46]" : "bg-white border-[#D9CFC7]"}`}>
                            {minutesList.map((m) => <div key={m} onClick={() => { setTimeMinute(m); setActiveTimeDropdown(null); }} className={`px-2 py-2 text-sm cursor-pointer text-center ${theme.popupText} ${theme.popupHover} ${timeMinute === m ? theme.accent : ''}`}>{m}</div>)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={addTodo} className={`w-full md:w-auto px-6 rounded-xl font-semibold transition-colors active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 ${isDarkMode ? "bg-[#948979] text-white hover:bg-[#7d7365]" : "bg-[#C9B59C] text-[#393E46] hover:bg-[#C9B59C] hover:text-[#222831]"}`}><Plus size={20} /> 추가</button>
              </div>
            </div>

            <div className="flex gap-2 mb-6 items-center">
              <div className={`flex-1 flex rounded-xl p-1.5 shadow-sm transition-colors duration-300 ${theme.panel} border ${theme.border}`}>
                {(["all", "active", "completed"] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${filter === f ? `${theme.accent} ${isDarkMode ? 'text-white' : 'text-[#393E46]'} shadow-sm` : `${theme.textSub} hover:bg-black/5`}`}>{f === "all" ? "전체" : f === "active" ? "진행중" : "완료됨"}</button>
                ))}
              </div>
              
              <div className="relative flex items-center gap-2" ref={sortMenuRef}>
                <button onClick={clearAllTodos} title="전체 삭제" className={`p-3 rounded-xl shadow-sm transition-colors duration-300 ${theme.panel} ${theme.textSub} hover:text-[#FF453A] hover:bg-[#FF453A]/10 border ${theme.border}`}><Trash2 size={20} /></button>
                <button onClick={() => setShowSortMenu(!showSortMenu)} className={`p-3 rounded-xl shadow-sm transition-colors duration-300 ${theme.panel} ${theme.textSub} hover:bg-black/5 border ${theme.border}`}><ArrowUpDown size={20} /></button>
                {showSortMenu && (
                  <div className={`absolute top-full right-0 mt-2 w-48 rounded-xl shadow-2xl border z-30 overflow-hidden ${isDarkMode ? "bg-[#2C2C2E] border-[#393E46]" : "bg-white border-[#D9CFC7]"}`}>
                    <div className="p-2 space-y-1">
                      <div className={`px-3 py-1.5 text-xs font-bold opacity-50 ${theme.textSub}`}>정렬</div>
                      <button onClick={() => { setSortOption("manual"); setShowSortMenu(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg ${sortOption === "manual" ? theme.accent : `${theme.popupText} ${theme.popupHover}`}`}>수동 (기본)</button>
                      <button onClick={() => { setSortOption("priority_desc"); setShowSortMenu(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg ${sortOption === "priority_desc" ? theme.accent : `${theme.popupText} ${theme.popupHover}`}`}>중요한 항목 순</button>
                      <button onClick={() => { setSortOption("date_desc"); setShowSortMenu(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg ${sortOption === "date_desc" ? theme.accent : `${theme.popupText} ${theme.popupHover}`}`}>최신 항목 순</button>
                      <button onClick={() => { setSortOption("date_asc"); setShowSortMenu(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg ${sortOption === "date_asc" ? theme.accent : `${theme.popupText} ${theme.popupHover}`}`}>오래된 항목 순</button>
                      <button onClick={() => { setSortOption("title_asc"); setShowSortMenu(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg ${sortOption === "title_asc" ? theme.accent : `${theme.popupText} ${theme.popupHover}`}`}>이름 순 A-Z</button>
                      <button onClick={() => { setSortOption("title_desc"); setShowSortMenu(false); }} className={`w-full text-left px-3 py-2 text-sm rounded-lg ${sortOption === "title_desc" ? theme.accent : `${theme.popupText} ${theme.popupHover}`}`}>이름 순 Z-A</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {filteredAndSortedTodos.length === 0 ? (
                <div className={`rounded-2xl shadow-sm p-12 text-center transition-colors duration-300 ${theme.panel} border ${theme.border}`}><p className={`text-lg ${theme.textSub}`}>할 일이 없습니다.</p></div>
              ) : (
                filteredAndSortedTodos.map((todo) => (
                  <div key={todo.id} className={`rounded-2xl shadow-sm p-4 flex items-center gap-3 group hover:shadow-md transition-all duration-200 border-l ${theme.panel} border-r border-t border-b ${theme.border} ${todo.completed ? 'opacity-60' : ''}`}
                    style={{ borderLeftColor: categories.find(c => c.id === todo.categoryId)?.color || '#C9B59C' }}
                  >
                    <button onClick={() => toggleTodo(todo.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${todo.completed ? `${isDarkMode ? 'bg-[#948979] border-[#948979]' : 'bg-[#D9CFC7] border-[#D9CFC7]'} text-white` : `border-gray-400 hover:border-[#948979]`}`}>{todo.completed && <Check size={12} />}</button>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      {editingId === todo.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input 
                            autoFocus
                            type="text" 
                            value={editText} 
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                            className={`flex-1 bg-transparent border-b border-gray-400 outline-none ${theme.textMain}`}
                          />
                          <button onClick={() => saveEdit(todo.id)} className="text-green-500"><Save size={16}/></button>
                          <button onClick={() => setEditingId(null)} className="text-red-500"><X size={16}/></button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-base font-medium leading-tight pt-[2px] whitespace-pre-wrap ${todo.completed ? "line-through text-gray-500" : theme.textMain}`}>
                              {todo.text}
                            </p>
                            
                            {todo.tags && todo.tags.map((tag, i) => (
                              <span key={i} className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded-full font-medium">
                                {tag}
                              </span>
                            ))}

                            {todo.dueDate && todo.time && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-[#FF453A] text-white`}>
                                {getDDayString(todo.dueDate)}
                              </span>
                            )}
                            
                            {selectedCategoryId === "all" && todo.categoryId && categories.find(c => c.id === todo.categoryId) && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isDarkMode ? "bg-[#222831] text-[#948979]" : "bg-[#F9F8F6] text-[#888]"}`}>{categories.find(c => c.id === todo.categoryId)?.name}</span>}
                          </div>

                          <div className={`flex items-center gap-3 text-[11px] ${theme.textSub} mt-1`}>
                            {todo.time && <span className="flex items-center gap-1 bg-black/5 px-1.5 py-0.5 rounded-md"><Clock size={10} />{todo.time}</span>}
                            {todo.location && <span className="flex items-center gap-1 bg-black/5 px-1.5 py-0.5 rounded-md"><MapPin size={10} />{todo.location}</span>}
                            <span className="opacity-60 font-mono ml-auto">
                              {formatFullDateTime(todo.createdAt)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 items-center shrink-0">
                      <button onClick={() => togglePriority(todo.id)} className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${todo.priority ? "text-[#FFD700]" : "text-gray-400 hover:text-[#FFD700]"}`}><Flag size={16} fill={todo.priority ? "currentColor" : "none"} /></button>
                      <button onClick={() => startEditing(todo.id, todo.text)} className={`w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${theme.textSub} hover:bg-black/5`}><Edit2 size={14} /></button>
                      <button onClick={() => deleteTodo(todo.id)} className={`w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-[#FF453A] hover:bg-[#FF453A]/10`}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {completedTodosCount > 0 && <div className="mt-6 text-center"><button onClick={clearCompleted} className={`text-sm transition-colors flex items-center justify-center gap-2 mx-auto ${theme.textSub} hover:text-[#FF453A]`}><Trash2 size={14} /> 완료된 항목 모두 삭제 ({completedTodosCount}개)</button></div>}
          </div>
        </main>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. Login Page Component
// ----------------------------------------------------------------------
import { supabase } from "./lib/supabaseClient";

// ----------------------------------------------------------------------
// 3. Login Page Component
function LoginPage({ isDarkMode, toggleTheme }: { isDarkMode: boolean; toggleTheme: () => void }) {
  const [isActive, setIsActive] = useState(false);
  const [signUpData, setSignUpData] = useState({ name: "", email: "", password: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  
  // 비밀번호 찾기 관련 State
  const [forgotPwMode, setForgotPwMode] = useState<'none' | 'verify'>('none');
  const [verifyData, setVerifyData] = useState({ name: "", email: "" });
  
  const theme = isDarkMode ? colors.dark : colors.light;
  
  // Supabase Auth Handlers
  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = signUpData.name.trim();
    const email = signUpData.email.trim();
    const password = signUpData.password.trim();

    const nameRegex = /^[가-힣]{2,5}$/;
    if (!nameRegex.test(name)) return alert("이름은 한글 2~5글자로 입력해주세요.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return alert("올바른 이메일 형식을 입력해주세요.");
    if (password.length < 8) return alert("비밀번호는 8자 이상 입력해주세요.");

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }, // Store name in metadata
        },
      });

      if (error) throw error;

      alert("회원가입 성공! 이메일을 확인해주세요 (혹은 바로 로그인 가능).");
      setIsActive(false); 
    } catch (error: any) {
      console.error("Signup Error:", error);
      alert(`오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = loginData.email.trim();
    const password = loginData.password.trim();

    if (!email) return alert("이메일을 입력해주세요.");
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // onLogin is handled by App's auth listener, but we can call it here too if needed
      // But typically, the state change in App will trigger the view switch.
    } catch (error: any) {
      console.error("Login Error:", error);
      alert(`로그인 실패: ${error.message}`);
    }
  };

  // 비밀번호 찾기 (Supabase Email)
  const handleVerifyUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = verifyData.email.trim();
    if (!email) return alert("이메일을 입력해주세요.");
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, 
      });
      if (error) throw error;
      alert("비밀번호 재설정 링크를 이메일로 보냈습니다. 확인해주세요.");
      setForgotPwMode('none');
    } catch (error: any) {
      alert(`오류: ${error.message}`);
    }
  };

  return (
    <div className={`flex min-h-[100dvh] items-center justify-center ${theme.bg} transition-colors duration-300 p-4`}>
      {/* Mobile View (< md) */}
      <div className={`md:hidden relative w-full max-w-sm overflow-hidden rounded-[30px] ${theme.panel} shadow-2xl border ${theme.border} p-8 flex flex-col items-center text-center`}>
        <div className="absolute top-4 right-4">
          <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} className={isDarkMode ? "bg-black/20" : "bg-black/5"} />
        </div>
        
        {forgotPwMode !== 'none' ? (
           // Forgot Password Forms (Mobile)
           <form className="w-full flex flex-col items-center mt-8 animate-fadeIn" onSubmit={handleVerifyUser}>
            <h1 className={`mb-2 text-2xl font-bold ${theme.textMain}`}>비밀번호 찾기</h1>
            <p className={`mb-6 text-sm ${theme.textSub}`}>가입한 이메일을 입력하시면재설정 링크를 보내드립니다.</p>
            <input type="email" placeholder="이메일" value={verifyData.email} onChange={(e) => setVerifyData({...verifyData, email: e.target.value})} className={`my-2 w-full rounded-xl border-none ${theme.inputBg} ${theme.textMain} p-4 text-sm outline-none transition-all focus:ring-1 focus:ring-[#948979]`} />
            <button type="submit" className={`mt-6 w-full rounded-xl ${theme.accent} py-4 text-base font-bold ${isDarkMode ? "text-white" : "text-[#393E46]"} hover:opacity-90 active:scale-[0.98]`}>링크 보내기</button>
            <button type="button" onClick={() => setForgotPwMode('none')} className={`mt-4 text-xs ${theme.textSub} hover:underline`}>취소</button>
           </form>
        ) : isActive ? (
          // Sign Up Form (Mobile)
          <form className="w-full flex flex-col items-center mt-8 animate-fadeIn" onSubmit={handleSignUp}>
            <h1 className={`mb-2 text-2xl font-bold ${theme.textMain}`}>회원가입</h1>
            <p className={`mb-6 text-sm ${theme.textSub}`}>새로운 계정을 만들어보세요!</p>
            
            <input type="text" placeholder="이름 (실명 2~5자)" value={signUpData.name} onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })} className={`my-2 w-full rounded-xl border-none ${theme.inputBg} ${theme.textMain} p-4 text-sm outline-none transition-all focus:ring-1 focus:ring-[#948979]`} />
            <input type="email" placeholder="이메일" value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} className={`my-2 w-full rounded-xl border-none ${theme.inputBg} ${theme.textMain} p-4 text-sm outline-none transition-all focus:ring-1 focus:ring-[#948979]`} />
            <input type="password" placeholder="비밀번호 (8자 이상)" value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} className={`my-2 w-full rounded-xl border-none ${theme.inputBg} ${theme.textMain} p-4 text-sm outline-none transition-all focus:ring-1 focus:ring-[#948979]`} />
            
            <button type="submit" className={`mt-6 w-full rounded-xl ${theme.accent} py-4 text-base font-bold ${isDarkMode ? "text-white" : "text-[#393E46]"} hover:opacity-90 active:scale-[0.98]`}>가입하기</button>
            
            <div className="mt-6 flex items-center gap-2 text-xs">
              <span className={theme.textSub}>이미 계정이 있으신가요?</span>
              <button type="button" onClick={() => setIsActive(false)} className={`font-bold ${theme.textMain} underline`}>로그인</button>
            </div>
          </form>
        ) : (
          // Login Form (Mobile)
          <form className="w-full flex flex-col items-center mt-8 animate-fadeIn" onSubmit={handleLogin}>
            <h1 className={`mb-2 text-2xl font-bold ${theme.textMain}`}>로그인</h1>
            <p className={`mb-6 text-sm ${theme.textSub}`}>오늘의 일정을 확인해보세요!</p>

            <input type="email" placeholder="이메일" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} className={`my-2 w-full rounded-xl border-none ${theme.inputBg} ${theme.textMain} p-4 text-sm outline-none transition-all focus:ring-1 focus:ring-[#948979]`} />
            <input type="password" placeholder="비밀번호" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className={`my-2 w-full rounded-xl border-none ${theme.inputBg} ${theme.textMain} p-4 text-sm outline-none transition-all focus:ring-1 focus:ring-[#948979]`} />
            
            <button type="submit" className={`mt-2 w-full rounded-xl ${theme.accent} py-4 text-base font-bold ${isDarkMode ? "text-white" : "text-[#393E46]"} hover:opacity-90 active:scale-[0.98]`}>로그인</button>
            
            <div className="mt-6 flex items-center gap-2 text-xs">
              <span className={theme.textSub}>아직 회원이 아니신가요?</span>
              <button type="button" onClick={() => setIsActive(true)} className={`font-bold ${theme.textMain} underline`}>회원가입</button>
            </div>

            <button type="button" onClick={() => setForgotPwMode('verify')} className={`mt-4 text-xs ${theme.textSub} hover:underline`}>비밀번호를 잊으셨나요?</button>
          </form>
        )}
      </div>

      {/* Desktop View (>= md) */}
      <div className={`hidden md:block relative w-[850px] max-w-full overflow-hidden rounded-[30px] ${theme.panel} shadow-2xl border ${theme.border}`} style={{ minHeight: "550px" }}>
        <div className="absolute top-6 right-6 z-10">
           <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} className={isDarkMode ? "bg-black/20" : "bg-black/5"} />
        </div>

        {/* Form Container */}
        <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out ${isActive ? "left-1/2 w-1/2 opacity-100 z-50 animate-move" : "left-0 w-1/2 opacity-0 z-10"}`}>
             <form className={`h-full flex flex-col items-center justify-center p-10 text-center ${theme.bg}`} onSubmit={handleSignUp}>
                <h1 className={`text-3xl font-bold mb-4 ${theme.textMain}`}>회원가입</h1>
                <div className="flex gap-4 mb-4">
                  <span className={`p-2 rounded-full border ${theme.border}`}><UserIcon size={16}/></span>
                  <span className={`p-2 rounded-full border ${theme.border}`}><Briefcase size={16}/></span>
                  <span className={`p-2 rounded-full border ${theme.border}`}><Heart size={16}/></span>
                </div>
                <span className={`text-xs ${theme.textSub} mb-4`}>이메일로 가입하기</span>
                <input type="text" placeholder="이름 (실명 2~5자)" value={signUpData.name} onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })} className={`my-2 w-full bg-gray-100 p-3 rounded-lg text-sm outline-none ${theme.inputBg} ${theme.textMain}`} />
                <input type="email" placeholder="이메일" value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} className={`my-2 w-full bg-gray-100 p-3 rounded-lg text-sm outline-none ${theme.inputBg} ${theme.textMain}`} />
                <input type="password" placeholder="비밀번호 (8자 이상)" value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} className={`my-2 w-full bg-gray-100 p-3 rounded-lg text-sm outline-none ${theme.inputBg} ${theme.textMain}`} />
                <button className={`mt-4 px-10 py-2 rounded-lg font-semibold text-white uppercase tracking-wider ${theme.accent} shadow-md`}>가입하기</button>
             </form>
        </div>

        <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out ${isActive ? "left-1/2 w-1/2 opacity-0 z-10" : "left-0 w-1/2 opacity-100 z-20"}`}>
             {forgotPwMode !== 'none' ? (
                // Forgot Password Form (Desktop)
                <form className={`h-full flex flex-col items-center justify-center p-10 text-center ${theme.bg}`} onSubmit={handleVerifyUser}>
                  <h1 className={`text-3xl font-bold mb-4 ${theme.textMain}`}>비밀번호 찾기</h1>
                  <p className={`text-sm ${theme.textSub} mb-6`}>가입한 이메일을 입력하시면<br/>재설정 링크를 보내드립니다.</p>
                  <input type="email" placeholder="이메일" value={verifyData.email} onChange={(e) => setVerifyData({...verifyData, email: e.target.value})} className={`my-2 w-full bg-gray-100 p-3 rounded-lg text-sm outline-none ${theme.inputBg} ${theme.textMain}`} />
                  <button className={`mt-4 px-10 py-2 rounded-lg font-semibold text-white uppercase tracking-wider ${theme.accent} shadow-md`}>링크 보내기</button>
                  <button type="button" onClick={() => setForgotPwMode('none')} className={`mt-4 text-xs ${theme.textSub} hover:underline`}>취소</button>
                </form>
             ) : (
                // Login Form (Desktop)
                <form className={`h-full flex flex-col items-center justify-center p-10 text-center ${theme.bg}`} onSubmit={handleLogin}>
                  <h1 className={`text-3xl font-bold mb-4 ${theme.textMain}`}>로그인</h1>
                  <div className="flex gap-4 mb-4">
                    <span className={`p-2 rounded-full border ${theme.border}`}><UserIcon size={16}/></span>
                    <span className={`p-2 rounded-full border ${theme.border}`}><Briefcase size={16}/></span>
                    <span className={`p-2 rounded-full border ${theme.border}`}><Heart size={16}/></span>
                  </div>
                  <span className={`text-xs ${theme.textSub} mb-4`}>이메일로 로그인하기</span>
                  <input type="email" placeholder="이메일" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} className={`my-2 w-full bg-gray-100 p-3 rounded-lg text-sm outline-none ${theme.inputBg} ${theme.textMain}`} />
                  <input type="password" placeholder="비밀번호" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className={`my-2 w-full bg-gray-100 p-3 rounded-lg text-sm outline-none ${theme.inputBg} ${theme.textMain}`} />
                  <button type="button" onClick={() => setForgotPwMode('verify')} className={`w-full text-right text-xs ${theme.textSub} mb-4 hover:underline`}>비밀번호를 잊으셨나요?</button>
                  <button className={`mt-4 px-10 py-2 rounded-lg font-semibold text-white uppercase tracking-wider ${theme.accent} shadow-md`}>로그인</button>
                </form>
             )}
        </div>

        {/* Overlay Container */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-[100] ${isActive ? "-translate-x-full" : ""}`}>
             <div className={`bg-gradient-to-r ${isDarkMode ? "from-[#2C2C2E] to-[#1E1E1E]" : "from-[#948979] to-[#D9CFC7]"} text-white relative -left-full h-full w-[200%] transform transition-transform duration-700 ease-in-out flex items-center justify-center ${isActive ? "translate-x-1/2" : "translate-x-0"}`}>
                
                <div className={`absolute w-1/2 h-full flex flex-col items-center justify-center px-8 text-center top-0 transform transition-transform duration-700 ease-in-out ${isActive ? "translate-x-0" : "-translate-x-[20%]"}`}>
                   <h1 className="text-3xl font-bold mb-4">반가워요!</h1>
                   <p className="text-sm mb-8">아직 회원이 아니신가요?<br/>회원가입하고 나만의 일정을 관리해보세요.</p>
                   <button className="bg-transparent border border-white px-10 py-2 rounded-lg font-semibold uppercase tracking-wider" onClick={() => setIsActive(true)}>회원가입</button>
                </div>

                <div className={`absolute w-1/2 h-full flex flex-col items-center justify-center px-8 text-center top-0 right-0 transform transition-transform duration-700 ease-in-out ${isActive ? "translate-x-[20%]" : "translate-x-0"}`}>
                   <h1 className="text-3xl font-bold mb-4">환영합니다!</h1>
                   <p className="text-sm mb-8">이미 계정이 있으신가요?<br/>로그인하고 일정을 확인하세요.</p>
                   <button className="bg-transparent border border-white px-10 py-2 rounded-lg font-semibold uppercase tracking-wider" onClick={() => setIsActive(false)}>로그인</button>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. Main App Component
// ----------------------------------------------------------------------
export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  
  useEffect(() => {
    // 1. 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ 
          id: session.user.id,
          username: session.user.user_metadata.name || "User", 
          email: session.user.email || "" 
        });
      }
    });

    // 2. Auth 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ 
          id: session.user.id,
          username: session.user.user_metadata.name || "User", 
          email: session.user.email || "" 
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (user) {
    return <TodoList user={user} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
  }

  return <LoginPage isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
}
