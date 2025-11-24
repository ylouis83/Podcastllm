export default function NavBar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <a href="/" className="flex items-center gap-2">
            {/* 如果有 logo，可以在这里添加 */}
            <h1 className="text-xl font-bold text-gray-800">PodCast AI</h1>
          </a>
        </div>
        {/* <div className="flex items-center">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
            <a href="https://github.com/YOYZHANG/ai-ppt" target="_blank" rel="noopener noreferrer" className="flex items-center">
              <BsGithub className="w-5 h-5 mr-2" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
            <a href="https://x.com/alexu19049062" target="_blank" rel="noopener noreferrer" className="flex items-center">
              <BsTwitterX className="w-5 h-5 mr-2" />
            </a>
          </Button>
        </div> */}
      </div>
    </nav>
  )
}
