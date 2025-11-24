import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import Menu from "./menu"
import { Button } from "./ui/button"
import { Sparkles } from "lucide-react"
import { useState } from "react"

/**
 * smallest component possible for mobile menu
 * @param props 
 * @returns 
 */
export default function MobileMenu(
    { handleGenerate,
        isGenerating }: { handleGenerate: (formData: FormData) => void, isGenerating: boolean }) {
            const [open,setOpen] = useState(false)
    return <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
            <Button
                className={`md:hidden
            w-full rounded-xl transition-all duration-300 transform hover:scale-105
            flex items-center justify-center space-x-2 
            text-white font-semibold  shadow-lg hover:shadow-xl
          `}
            >
                <Sparkles className="size-5" />
                <span>立即制作</span>
            </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col h-screen">
            <SheetHeader>
                <SheetTitle>开始制作</SheetTitle>
            </SheetHeader>
            <div className="flex-1 h-1">
                <Menu
                    isGenerating={isGenerating}
                    handleGenerate={data => {
                        setOpen(false)
                        return handleGenerate(data)
                    }}
                    className="!border-none p-0 m-0 !shadow-none" />
            </div>
        </SheetContent>
    </Sheet>

}
