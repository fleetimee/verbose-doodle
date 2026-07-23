import {
  Activity01Icon,
  AiNetworkIcon,
  AlertCircleIcon,
  ArrowUpDownIcon,
  BarChartIcon,
  BinaryIcon,
  BracesIcon,
  Building01Icon,
  CableIcon,
  Calendar03Icon,
  CalendarClockIcon,
  CheckIcon as CheckDefinition,
  CheckmarkCircle02Icon,
  CircleDashedIcon,
  CircleIcon as CircleDefinition,
  CircleOffIcon,
  ClipboardCopyIcon,
  ClipboardIcon,
  Clock03Icon,
  CodeIcon,
  CompassIcon,
  ComputerArrowDownIcon,
  ComputerArrowUpIcon,
  CpuIcon,
  CursorPointer01Icon,
  CursorTextIcon,
  DashboardSquare01Icon,
  DoorClosedIcon as DoorClosedDefinition,
  EraserIcon,
  EyeIcon,
  File01Icon,
  FileClockIcon,
  FileCodeIcon,
  FileTerminalIcon,
  FingerprintPatternIcon,
  GaugeIcon,
  GitCommitIcon as GitCommitDefinition,
  GlobeIcon,
  Grid2X2Icon,
  HashIcon,
  InformationCircleIcon,
  Key01Icon,
  LayerIcon,
  Layers01Icon,
  LayoutGridIcon,
  ListFilterPlusIcon,
  ListXIcon,
  Login01Icon,
  MagicWand01Icon,
  MailSend01Icon,
  MessageSquareCodeIcon,
  MoonIcon,
  MoreHorizontalCircle01Icon,
  Pen01Icon,
  PlayIcon,
  Plug01Icon,
  PlugSocketIcon,
  Radio02Icon,
  RadioIcon,
  Refresh01Icon,
  ResetPasswordIcon,
  Route01Icon,
  SecurityCheckIcon,
  ServerStack01Icon,
  ShieldBanIcon,
  SignalIcon,
  SlidersHorizontalIcon,
  Sun03Icon,
  Tag01Icon,
  Timer01Icon,
  TorusIcon,
  TrendingUpDownIcon,
  UserCheck01Icon,
  UserGroupIcon,
  UserIcon,
  UserMultipleIcon,
  UserSettings01Icon,
  WaveIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { ComponentProps, ComponentType } from "react";

export type HugeIconProps = Omit<ComponentProps<typeof HugeiconsIcon>, "icon">;
export type HugeIcon = ComponentType<HugeIconProps>;

const createHugeIcon =
  (icon: IconSvgElement): HugeIcon =>
  (props) => <HugeiconsIcon icon={icon} strokeWidth={2} {...props} />;

export const Activity = createHugeIcon(Activity01Icon);
export const ArrowUpDown = createHugeIcon(ArrowUpDownIcon);
export const BarChart3 = createHugeIcon(BarChartIcon);
export const Binary = createHugeIcon(BinaryIcon);
export const Braces = createHugeIcon(BracesIcon);
export const Building2 = createHugeIcon(Building01Icon);
export const Cable = createHugeIcon(CableIcon);
export const CalendarClock = createHugeIcon(CalendarClockIcon);
export const CalendarDays = createHugeIcon(Calendar03Icon);
export const Check = createHugeIcon(CheckDefinition);
export const CheckCircle = createHugeIcon(CheckmarkCircle02Icon);
export const CheckCircle2 = createHugeIcon(CheckmarkCircle02Icon);
export const Circle = createHugeIcon(CircleDefinition);
export const CircleAlert = createHugeIcon(AlertCircleIcon);
export const CircleDashed = createHugeIcon(CircleDashedIcon);
export const CircleIcon = createHugeIcon(CircleDefinition);
export const CircleOff = createHugeIcon(CircleOffIcon);
export const Clipboard = createHugeIcon(ClipboardIcon);
export const ClipboardCopy = createHugeIcon(ClipboardCopyIcon);
export const Clock3 = createHugeIcon(Clock03Icon);
export const Code2 = createHugeIcon(CodeIcon);
export const Compass = createHugeIcon(CompassIcon);
export const Cpu = createHugeIcon(CpuIcon);
export const CursorText = createHugeIcon(CursorTextIcon);
export const DoorClosedIcon = createHugeIcon(DoorClosedDefinition);
export const Eraser = createHugeIcon(EraserIcon);
export const Eye = createHugeIcon(EyeIcon);
export const FileClock = createHugeIcon(FileClockIcon);
export const FileJson = createHugeIcon(FileCodeIcon);
export const FileTerminal = createHugeIcon(FileTerminalIcon);
export const FileText = createHugeIcon(File01Icon);
export const Fingerprint = createHugeIcon(FingerprintPatternIcon);
export const GitCommitIcon = createHugeIcon(GitCommitDefinition);
export const Globe = createHugeIcon(GlobeIcon);
export const Globe2 = createHugeIcon(GlobeIcon);
export const Gauge = createHugeIcon(GaugeIcon);
export const Grid2X2 = createHugeIcon(Grid2X2Icon);
export const Hash = createHugeIcon(HashIcon);
export const Info = createHugeIcon(InformationCircleIcon);
export const KeyRound = createHugeIcon(Key01Icon);
export const KeyRoundIcon = createHugeIcon(Key01Icon);
export const Layers3 = createHugeIcon(Layers01Icon);
export const LayersIcon = createHugeIcon(LayerIcon);
export const LayoutDashboard = createHugeIcon(DashboardSquare01Icon);
export const LayoutGrid = createHugeIcon(LayoutGridIcon);
export const ListFilter = createHugeIcon(ListFilterPlusIcon);
export const ListX = createHugeIcon(ListXIcon);
export const LogInIcon = createHugeIcon(Login01Icon);
export const LoaderCircle = createHugeIcon(Refresh01Icon);
export const MessageSquareText = createHugeIcon(MessageSquareCodeIcon);
export const Moon = createHugeIcon(MoonIcon);
export const MousePointerClick = createHugeIcon(CursorPointer01Icon);
export const MonitorDown = createHugeIcon(ComputerArrowDownIcon);
export const MonitorUp = createHugeIcon(ComputerArrowUpIcon);
export const Network = createHugeIcon(AiNetworkIcon);
export const Pen = createHugeIcon(Pen01Icon);
export const Play = createHugeIcon(PlayIcon);
export const Plug = createHugeIcon(Plug01Icon);
export const Radio = createHugeIcon(RadioIcon);
export const RadioReceiver = createHugeIcon(RadioIcon);
export const RadioTower = createHugeIcon(Radio02Icon);
export const RefreshCw = createHugeIcon(Refresh01Icon);
export const RotateCcw = createHugeIcon(Refresh01Icon);
export const Route = createHugeIcon(Route01Icon);
export const SendHorizontal = createHugeIcon(MailSend01Icon);
export const Server = createHugeIcon(ServerStack01Icon);
export const ServerCrash = createHugeIcon(ServerStack01Icon);
export const ShieldAlert = createHugeIcon(ShieldBanIcon);
export const ShieldCheck = createHugeIcon(SecurityCheckIcon);
export const ShieldCheckIcon = createHugeIcon(SecurityCheckIcon);
export const Signal = createHugeIcon(SignalIcon);
export const SlidersHorizontal = createHugeIcon(SlidersHorizontalIcon);
export const Sun = createHugeIcon(Sun03Icon);
export const TagIcon = createHugeIcon(Tag01Icon);
export const TextCursor = createHugeIcon(CursorTextIcon);
export const Timer = createHugeIcon(Timer01Icon);
export const TimerReset = createHugeIcon(ResetPasswordIcon);
export const Torus = createHugeIcon(TorusIcon);
export const TrendingUp = createHugeIcon(TrendingUpDownIcon);
export const Unplug = createHugeIcon(PlugSocketIcon);
export const User = createHugeIcon(UserIcon);
export const UserCheck = createHugeIcon(UserCheck01Icon);
export const UserCog = createHugeIcon(UserSettings01Icon);
export const Users = createHugeIcon(UserMultipleIcon);
export const UsersRound = createHugeIcon(UserGroupIcon);
export const Waves = createHugeIcon(WaveIcon);
export const Wand2 = createHugeIcon(MagicWand01Icon);

export const CheckIcon = Check;
export const CopyIcon = createHugeIcon(ClipboardCopyIcon);
export const MoreHorizontal = createHugeIcon(MoreHorizontalCircle01Icon);
