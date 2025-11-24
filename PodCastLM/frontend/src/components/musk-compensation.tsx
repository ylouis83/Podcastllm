import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MuskCompensation() {
  const marketCapTargets = [
    { value: 2, achieved: 1, stockValue: 221 },
    { value: 2.5, achieved: 2, stockValue: 442 },
    { value: 3, achieved: 3, stockValue: 663 },
    { value: 3.5, achieved: 4, stockValue: 884 },
    { value: 4, achieved: 5, stockValue: 1105 },
    { value: 4.5, achieved: 6, stockValue: 1326 },
    { value: 5, achieved: 7, stockValue: 1547 },
    { value: 5.5, achieved: 8, stockValue: 1768 },
    { value: 6, achieved: 9, stockValue: 1989 },
    { value: 6.5, achieved: 10, stockValue: 2210 },
    { value: 7.5, achieved: 11, stockValue: 2431 },
    { value: 8.5, achieved: 12, stockValue: 11290 },
  ];

  const operationalTargets = [
    {
      id: 1,
      title: "汽车累计交付量2000万辆",
      difficulty: 1,
      progress: 42.25,
      current: 846,
      unit: "万辆",
      note: "预计未来10年每年交付量至少115万辆才能达标",
      status: "in_progress",
    },
    {
      id: 2,
      title: "连续三个月商业运营Robotaxi日均超过100万辆",
      difficulty: 3,
      progress: null,
      current: null,
      unit: "",
      note: "已开展小规模试点,但进度落后于友商Waymo、Cruise等",
      status: "unknown",
    },
    {
      id: 3,
      title: "从2025年9月3日起计人形机器人累计交付量100万个",
      difficulty: 5,
      progress: 0,
      current: 0,
      unit: "个",
      note: "",
      status: "not_started",
    },
    {
      id: 4,
      title: "连续3个月日均FSD*活跃订阅用户超过1000万",
      difficulty: 5,
      progress: null,
      current: null,
      unit: "",
      note: "*特斯拉研发的完全自动驾驶系统",
      status: "unknown",
    },
  ];

  const ebitdaTargets = [
    { id: 5, value: 500, difficulty: 2, note: "≈2024年全球车企最高EBITDA** 丰田:559亿美元" },
    { id: 6, value: 800, difficulty: 2, note: "" },
    { id: 7, value: 1300, difficulty: 3, note: "≈2024年美股最高EBITDA** 谷歌:1351亿美元" },
    { id: 8, value: 2100, difficulty: 3, note: "≈2024年全球最高EBITDA** 沙特阿美:2342亿美元" },
    { id: 9, value: 3000, difficulty: 3, note: "" },
    { id: 10, value: 4000, difficulty: 5, note: "连续的4个季度内完成" },
    { id: 11, value: 4000, difficulty: 5, note: "连续的4个季度内完成" },
    { id: 12, value: 4000, difficulty: 5, note: "连续的4个季度内完成" },
  ];

  // 当前完成的目标数
  // 根据信息图，Mario显示在6.5和7.5之间（第10和第11个目标之间）
  // 但实际市值只有1.54万亿美元，所以这里使用信息图中的示意位置
  // 实际应用中可以根据实时市值计算: const currentMarketCap = 1.54;
  const achievedSteps = 10; // 信息图中显示已完成10项（Mario在6.5和7.5之间）

  const getDifficultyStars = (difficulty: number) => {
    return "★".repeat(difficulty);
  };

  const opponents = [
    {
      name: "挪威央行投资管理NBIM",
      holding: "1.12%",
      arguments: [
        {
          title: "给太多了",
          content: "1万亿美元的薪酬规模在企业史上史无前例且远超行业常规",
        },
        {
          title: "会伤害其他股东",
          content: "其他股东的股权在这一过程中可能被稀释且马斯克已经是最大股东更多股权可能会使其权力过大",
        },
        {
          title: "押宝马斯克这个人太冒险",
          content: "马斯克同时管理多家企业且涉足政治事务无法专注于特斯拉",
        },
      ],
    },
    {
      name: "美国加州公共雇员退休基金Calpers",
      holding: "0.16%",
      arguments: [],
    },
    {
      name: "股东投票代理公司Glass Lewis、ISS",
      holding: "建议股东投反对票",
      arguments: [],
    },
  ];

  const supporters = [
    {
      name: "埃隆·马斯克",
      holding: "15.30%",
      arguments: [
        {
          title: "大胆且以绩效为导向的激励机制",
          content: "大胆且以绩效为导向的激励机制",
        },
        {
          title: "马斯克就是特斯拉的核心人物",
          content: "马斯克就是特斯拉的核心人物他与特斯拉密不可分",
        },
        {
          title: "确保马斯克能专注于特斯拉的业务",
          content: "计划本身就是在确保马斯克能专注于特斯拉的业务",
        },
      ],
    },
    { name: "嘉信理财投资管理", holding: "0.59%", arguments: [] },
    { name: "巴伦资本BAMCO", holding: "0.40%", arguments: [] },
    { name: "ARK方舟基金", holding: "0.11%", arguments: [] },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200 p-4 md:p-8 relative overflow-hidden">
      {/* Cloud decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 left-10 w-32 h-16 bg-white rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-40 h-20 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-40 left-1/4 w-36 h-18 bg-white rounded-full blur-xl"></div>
        <div className="absolute top-60 right-1/3 w-28 h-14 bg-white rounded-full blur-xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl">
              马斯克
            </h1>
            <div className="text-xl md:text-3xl font-mono text-white font-bold drop-shadow-lg">
              $1,000,000,000,000
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-yellow-300 drop-shadow-2xl">
            万亿薪酬大冲关
          </h2>
          <div className="text-sm text-white mt-4 drop-shadow">
            <div>金十数据 | 2025-11-06制图</div>
          </div>
        </div>

        {/* Plan Initiation & Voting */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-2 border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">计划发起</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-semibold">北京时间2025年9月5日18:00</div>
                <div className="text-sm text-gray-600">
                  特斯拉董事会提出"CEO薪酬计划"
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">计划表决</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-semibold">北京时间2025年11月7日凌晨05:00</div>
                <div className="text-sm text-gray-600">
                  特斯拉股东大会将投票表决该计划
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CEO Reward Mechanism */}
        <Card className="bg-green-50 border-green-500 border-2">
          <CardHeader>
            <CardTitle className="text-green-700 text-2xl">
              CEO奖励机制
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="font-semibold">为期10年,分12步进行</div>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>每一步需完成1个市值目标+1个运营目标</li>
              <li>每完成一步,CEO即可获得3531.2万股股份;</li>
              <li>累计可获得4.24亿股股份</li>
              <li>约占调整后股份数的12%,价值将超过1万亿美元</li>
              <li>若达不成目标,CEO无法获得其他形式的报酬</li>
            </ul>
          </CardContent>
        </Card>

        {/* Market Cap Targets - Mario Style */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-yellow-600">
              12个市值目标 (万亿美元)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-sm text-gray-600">
              <div>6个月内日均市值及30天内日均市值都超过目标</div>
              <div className="mt-2 font-semibold">
                当前进度: 截至2025年11月5日，特斯拉总市值为1.54万亿美元
              </div>
            </div>

            {/* Mario-style progression */}
            <div className="relative py-12 overflow-x-auto bg-gradient-to-b from-blue-200 to-blue-100 rounded-lg p-4">
              <div className="flex items-end gap-3 min-w-max pb-8">
                {marketCapTargets.map((target, index) => {
                  const isAchieved = index < achievedSteps;
                  const height = 30 + index * 6;
                  const baseHeight = 80;
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-2 relative"
                      style={{ minWidth: "70px" }}
                    >
                      {/* Coin */}
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-xs font-bold border-4 shadow-lg transition-all ${
                          isAchieved
                            ? "bg-yellow-400 border-yellow-600 text-yellow-900 animate-bounce"
                            : "bg-gray-300 border-gray-400 text-gray-600"
                        }`}
                      >
                        ${target.value}
                      </div>
                      {/* Platform */}
                      <div
                        className={`w-16 rounded-t-lg border-2 shadow-md ${
                          isAchieved
                            ? "bg-orange-600 border-orange-800"
                            : "bg-gray-400 border-gray-600"
                        }`}
                        style={{ 
                          height: `${baseHeight + height}px`,
                          minHeight: `${baseHeight + height}px`
                        }}
                      />
                      {/* Achievement label */}
                      <div className="text-xs text-center font-semibold mt-1">
                        {target.achieved === 12 ? "达成全部12项" : `达成${target.achieved}项`}
                      </div>
                      {/* Stock value */}
                      <div className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                        ${target.stockValue}亿
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Mario character - positioned between 6.5 and 7.5 (between step 10 and 11) */}
              {achievedSteps >= 0 && (
                <div
                  className="absolute bottom-28 transition-all duration-500 z-10"
                  style={{
                    // Position Mario between the 10th and 11th target (index 9 and 10)
                    // Calculate position: start of 10th + half way to 11th
                    left: `calc(${((achievedSteps - 0.5) / marketCapTargets.length) * 100}% - 20px)`,
                  }}
                >
                  <div className="w-10 h-14 bg-red-500 rounded-t-lg border-2 border-red-700 relative shadow-lg">
                    {/* Head */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-600"></div>
                    {/* Eyes */}
                    <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full"></div>
                    {/* Body */}
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-red-500 rounded-b-lg"></div>
                    {/* Mustache (Musk style) */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-800"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              若达标,马斯克最终的持股比例可能在25%左右
            </div>
          </CardContent>
        </Card>

        {/* Operational Targets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-yellow-600">
              12项运营目标都有啥
            </CardTitle>
            <div className="text-sm text-gray-600 space-x-4">
              <span>★简单</span>
              <span>★★较难</span>
              <span>★★★困难</span>
              <span>★★★★★艰难</span>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="products" className="w-full">
              <TabsList>
                <TabsTrigger value="products">产品目标</TabsTrigger>
                <TabsTrigger value="profit">利润目标</TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="space-y-4 mt-4">
                {operationalTargets.map((target) => (
                  <Card key={target.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {target.id}. {target.title}
                        </CardTitle>
                        <div className="text-yellow-600">
                          {getDifficultyStars(target.difficulty)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {target.progress !== null ? (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span>当前进度:</span>
                              <span className="font-semibold">
                                {target.progress}% ({target.current}
                                {target.unit})
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${target.progress}%` }}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-500">进度: 未知</div>
                        )}
                        {target.note && (
                          <div className="text-sm text-gray-600">{target.note}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="profit" className="space-y-4 mt-4">
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold mb-2">
                    年度调整后息税折旧摊销前利润EBITDA*
                  </div>
                  <div className="text-sm text-gray-600">
                    2024年特斯拉EBITDA**为131亿美元
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    *即扣除利息、所得税、固定资产折旧、无形资产与长期资产摊销前的企业盈利
                  </div>
                  <div className="text-xs text-gray-500">
                    **计算方式=利润总额+利息费用(不含资本化利息支出)+资产的折旧与摊销
                  </div>
                </div>

                {ebitdaTargets.map((target) => (
                  <Card key={target.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {target.id}. ${target.value}亿
                        </CardTitle>
                        <div className="text-yellow-600">
                          {getDifficultyStars(target.difficulty)}
                        </div>
                      </div>
                    </CardHeader>
                    {target.note && (
                      <CardContent>
                        <div className="text-sm text-gray-600">{target.note}</div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Shareholder Support/Opposition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              多位大股东不支持"万亿薪酬"方案
            </CardTitle>
            <div className="text-xs text-gray-500">
              注:路透社援引伦敦证交所等数据
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Opponents */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-red-600">反对方</h3>
                {opponents.map((shareholder, index) => (
                  <Card key={index} className="border-red-200">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm">{shareholder.name}</CardTitle>
                        <span className="text-xs text-gray-500">
                          {shareholder.holding}
                        </span>
                      </div>
                    </CardHeader>
                    {shareholder.arguments.length > 0 && (
                      <CardContent className="space-y-2">
                        {shareholder.arguments.map((arg, argIndex) => (
                          <div
                            key={argIndex}
                            className="p-3 bg-red-50 rounded-lg border border-red-200"
                          >
                            <div className="font-semibold text-red-700 mb-1">
                              {arg.title}
                            </div>
                            <div className="text-sm text-gray-700">{arg.content}</div>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                ))}
                <div className="p-4 bg-red-100 rounded-lg border-2 border-red-300">
                  <div className="font-semibold text-red-800 mb-2">马斯克:</div>
                  <div className="text-red-700">"你们是企业恐怖分子"</div>
                </div>
              </div>

              {/* Supporters */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-blue-600">支持方</h3>
                {supporters.map((shareholder, index) => (
                  <Card key={index} className="border-blue-200">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm">{shareholder.name}</CardTitle>
                        <span className="text-xs text-gray-500">
                          {shareholder.holding}
                        </span>
                      </div>
                    </CardHeader>
                    {shareholder.arguments.length > 0 && (
                      <CardContent className="space-y-2">
                        {shareholder.arguments.map((arg, argIndex) => (
                          <div
                            key={argIndex}
                            className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                          >
                            <div className="font-semibold text-blue-700 mb-1">
                              {arg.title}
                            </div>
                            <div className="text-sm text-gray-700">{arg.content}</div>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

