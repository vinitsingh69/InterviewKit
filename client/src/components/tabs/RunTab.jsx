import { useRunCode } from "@/hooks/useRunCode"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import toast from "react-hot-toast"
import { PiCaretDownBold } from "react-icons/pi"
import { LuCopy } from "react-icons/lu"

function RunTab() {
    const { tabHeight } = useWindowDimensions()
    const {
        setInput,
        output,
        isRunning,
        supportedLanguages,
        selectedLanguage,
        setSelectedLanguage,
        runCode,
    } = useRunCode()

    const handleLanguageChange = (e) => {
        const lang = JSON.parse(e.target.value)
        setSelectedLanguage(lang)
    }

    const copyOutput = () => {
        navigator.clipboard.writeText(output)
        toast.success("Output copied to clipboard")
    }

    return (
        <div
            className="flex flex-col items-center gap-2 p-4"
            style={{ height: tabHeight }}
        >
            <h1 className="tab-title">Run Code</h1>
            <div className="flex h-[90%] w-full flex-col items-end gap-2 md:h-[92%]">
                <div className="relative w-full">
                    <select
                        className="w-full rounded-md border-none bg-darkHover px-4 py-2 text-white outline-none"
                        value={JSON.stringify(selectedLanguage)}
                        onChange={handleLanguageChange}
                    >
                        {supportedLanguages
                            .sort((a, b) => (a.language > b.language ? 1 : -1))
                            .map((lang, i) => {
                                return (
                                    <option
                                        key={i}
                                        value={JSON.stringify(lang)}
                                    >
                                        {lang.language +
                                            (lang.version
                                                ? ` (${lang.version})`
                                                : "")}
                                    </option>
                                )
                            })}
                    </select>
                    <PiCaretDownBold
                        size={16}
                        className="absolute bottom-3 right-4 z-10 text-white"
                    />
                </div>
                <textarea
                    type="text"
                    className="min-h-[120px] w-full resize-none rounded-md border-none bg-darkHover p-2 text-white outline-none"
                    placeholder="Write you input here..."
                    onChange={(e) => setInput(e.target.value)}
                />
                <button
                    className="flex w-full justify-center rounded-md bg-white p-2 font-bold text-black outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={runCode}
                    disabled={isRunning}
                >
                    Run
                </button>
                <label className="flex w-full justify-between">
                    Output :
                    <button onClick={copyOutput} title="Copy Output">
                        <LuCopy
                            size={18}
                            className="cursor-pointer text-white"
                        />
                    </button>
                </label>
                <div className="w-full flex-grow resize-none overflow-y-auto rounded-md border-none bg-darkHover p-2 text-white outline-none">
                    <code>
                        <pre className="text-wrap">{output}</pre>
                    </code>
                </div>
            </div>
        </div>
    )
}

export default RunTab
