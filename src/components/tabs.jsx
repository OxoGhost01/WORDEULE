
// Row of tabs. tabs: [{ id, label }], active: id of the open tab, onChange(id) when one is clicked.
// The content of the tab is up to the page.
export default function Tabs({ tabs, active, onChange }) {
    return (
        <div role="tablist" className="flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    role="tab"
                    aria-selected={tab.id === active}
                    onClick={() => onChange(tab.id)}
                    className={`cursor-pointer border-[3px] border-ink px-3 py-1 font-display text-lg font-extrabold uppercase transition ${
                        tab.id === active ? '-translate-y-1 bg-sun shadow-hard' : 'bg-card hover:bg-pink'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
