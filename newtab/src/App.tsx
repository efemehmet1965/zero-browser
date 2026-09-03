import SearchBar from './components/SearchBar';
import Shortcuts from './components/Shortcuts';
import RecentWorkspaces from './components/RecentWorkspaces';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import WindowBar from './components/WindowBar';
import ZeroLogo from './components/ZeroLogo';
import { useZeroState } from './store';

// ZERO newtab — full-window pixel clone of the reference screenshot.
// Layout: WindowBar / Toolbar / [Sidebar 180px | centered content max-w 800px].
// The outer WindowBar+Toolbar mirror what userChrome.css paints on native
// Firefox chrome, so the demo looks seamless either way.
export default function App() {
  const { state, setActiveWorkspace, addShortcut, removeShortcut } = useZeroState();

  return (
    <div className="flex h-full flex-col bg-black text-white">
      <WindowBar />
      <Toolbar />
      <div className="flex min-h-0 flex-1 border-t border-[#1E1E1E]">
        <Sidebar />
        <main className="flex min-w-0 flex-1 items-start justify-center overflow-y-auto border-l border-[#1E1E1E] bg-black">
          <div className="flex w-full max-w-[800px] flex-col items-center px-8 pb-16 pt-14">
            <ZeroLogo />
            <p className="mt-2 text-[14px] uppercase tracking-[0.45em]">
              <span className="font-bold text-[#E30613]">ZERO.</span>{' '}
              <span className="text-[#888]">Just the web.</span>
            </p>

            <div className="mt-8 w-full max-w-[640px]">
              <SearchBar />
            </div>

            <div className="mt-8">
              <Shortcuts shortcuts={state.shortcuts} onAdd={addShortcut} onRemove={removeShortcut} />
            </div>

            <RecentWorkspaces
              workspaces={state.workspaces}
              activeId={state.activeWorkspaceId}
              onSelect={setActiveWorkspace}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
