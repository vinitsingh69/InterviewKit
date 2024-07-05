import Select from "@/components/common/Select"
import useSetting from "@/hooks/useSetting"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { editorFonts } from "@/resources/Fonts"
import { editorThemes } from "@/resources/Themes"
import { useEffect } from "react"
import { langNames } from "@uiw/codemirror-extensions-langs"

function SettingsTab() {
    const {
        theme,
        setTheme,
        language,
        setLanguage,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,  
        resetSettings,
    } = useSetting()
    const { tabHeight } = useWindowDimensions()

    const handleFontFamilyChange = (e) => setFontFamily(e.target.value)
    const handleThemeChange = (e) => setTheme(e.target.value)
    const handleLanguageChange = (e) => setLanguage(e.target.value)
    const handleFontSizeChange = (e) => setFontSize(parseInt(e.target.value))
    

    useEffect(() => {
        // Set editor font family
        const editor = document.querySelector(".cm-editor > .cm-scroller")
        if (editor !== null) {
            editor.style.fontFamily = `${fontFamily}, monospace`
        }
    }, [fontFamily])

    return (
        <div
            className="flex flex-col items-center gap-2 p-4"
            style={{ height: tabHeight }}
        >
            <h1 className="tab-title">Settings</h1>
            {/* Choose Font Family option */}
            <div className="flex w-full items-end gap-2">
                <Select
                    onChange={handleFontFamilyChange}
                    value={fontFamily}
                    options={editorFonts}
                    title="Fonts Family"
                />
                {/* Choose font size option */}
                <select
                    value={fontSize}
                    onChange={handleFontSizeChange}
                    className="rounded-md border-none bg-darkHover px-4 py-2 text-white outline-none"
                    title="Font Size"
                >
                    {[...Array(13).keys()].map((size) => {
                        return (
                            <option key={size} value={size + 12}>
                                {size + 12}
                            </option>
                        )
                    })}
                </select>
            </div>
            {/* Choose theme option */}
            <Select
                onChange={handleThemeChange}
                value={theme}
                options={Object.keys(editorThemes)}
                title="Theme"
            />
            {/* Choose language option */}
            <Select
                onChange={handleLanguageChange}
                value={language}
                options={langNames}
                title="Language"
            />
            {/* Show GitHub corner option */}
            {/* <div className="mt-4 flex w-full items-center justify-between">
                <label>Show github corner</label>
                <label className="relative inline-flex cursor-pointer items-center">
                    <input
                        className="peer sr-only"
                        type="checkbox"
                        onChange={handleShowGitHubCornerChange}
                        checked={showGitHubCorner}
                    />
                    <div className="peer h-6 w-12 rounded-full bg-darkHover outline-none duration-100 after:absolute after:left-1 after:top-1 after:flex after:h-4 after:w-4 after:items-center after:justify-center after:rounded-full after:bg-white after:font-bold after:outline-none after:duration-500 peer-checked:after:translate-x-6 peer-checked:after:border-white peer-focus:outline-none"></div>
                </label>
            </div> */}
            <button
                className="mt-auto w-full rounded-md border-none bg-darkHover px-4 py-2 text-white outline-none"
                onClick={resetSettings}
            >
                Reset to default
            </button>
        </div>
    )
}

export default SettingsTab
