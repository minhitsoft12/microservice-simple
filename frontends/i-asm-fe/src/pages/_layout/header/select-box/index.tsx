import styles from "./select-box.module.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";

const SelectBox = () => {
  return (
    <Select>
      <SelectTrigger
        className={cn(
          "w-[400px] h-[60px] tablet:h-11 tablet:w-[200px] mobile:h-11 mobile:w-44",
          styles.selectTrigger
        )}
      >
        <SelectValue placeholder="新規" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="m@example.com">新卒</SelectItem>
        <SelectItem value="m2@example.com">新卒</SelectItem>
        <SelectItem value="m3@example.com">新卒</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SelectBox;
