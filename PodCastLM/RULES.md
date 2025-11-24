# PodCastLM 项目开发规范

## 1. 总体原则
- 以可读性优先：宁可多写几行，也不要牺牲可读性。
- 模块化与可复用：拆分成清晰职责的模块，避免重复实现。
- 最小惊讶：遵循 Python 社区主流习惯（PEP 8/PEP 484），让后来者能快速理解。
- 面向测试：新增功能必须配套自动化测试或最少的可复现实例。

## 2. 代码编写规范
| 项目 | 说明 |
| --- | --- |
| 代码风格 | 遵循 PEP 8，推荐使用 `ruff`/`flake8`/`black` 做静态检测与格式化。 |
| 类型标注 | 新增模块必须补全类型注解，显式导出 `__all__` 控制 API 面。 |
| 函数长度 | 函数/方法保持在 40 行以内，超出时需拆分并补充文档字符串。 |
| 日志 | 统一使用 `logging`，禁止 `print`；按模块创建 logger。 |
| 错误处理 | 捕获具体异常类型并附 context message，禁止裸 `except`。 |
| 配置 | 环境相关的常量写入 `.env`/配置文件，通过 `pydantic` 或 `dataclasses` 解析。 |
| 文档 | 每个公共类/函数必须包含 docstring，说明输入、输出、异常和示例。 |

## 3. 文件命名规则
- Python 模块：`snake_case.py`，避免大写和特殊字符。
- 类和异常：`PascalCase`，常量使用 `UPPER_SNAKE_CASE`。
- Test 文件：`test_<模块>.py`，同级或 `tests/` 目录。
- 脚本：可执行脚本统一放在 `scripts/`，以用途命名（如 `scripts/build_dataset.py`）。
- 资产：前端资源或模型权重使用小写字母并包含版本号，例如 `model_en_v1.pt`。

## 4. 文件夹结构
```
PodCastLM/
├── backend/        # FastAPI / 数据处理后端
│   ├── app/        # 业务逻辑、路由与服务
│   ├── core/       # 配置、依赖注入、基础设施
│   ├── models/     # Pydantic/DB 模型
│   ├── services/   # 与外部系统的交互封装
│   └── tests/      # 后端测试
├── frontend/       # Web 客户端，约定 src/components、pages、hooks、assets 等
├── assets/         # 静态资源（图片、音频样例等）
├── example/        # 最小可运行示例或 notebook
└── scripts/        # 训练、部署、数据处理脚本（按 `domain_action.py` 命名）
```
### 子目录约束
- 同级目录下避免出现重复命名（如 `app/app`）；跨层引用通过绝对导入。
- 新增模块时需在 README 或上层 `__init__.py` 中简述用途。
- 大体量子模块（>1000 行）应独立成子包，内含 `__init__.py`、`config.py`、`service.py` 等清晰入口。

## 5. 测试与质量门槛
- 单元测试覆盖核心逻辑，使用 `pytest`，命名为 `test_*`.
- 集成测试应放在 `tests/integration`，需要说明依赖的外部服务。
- PR 需通过：`ruff check .`、`pytest`、前端 `npm run test`（如适用）。
- 对涉及音频/大模型的模块提供可复现脚本（放在 `example/` 或 `scripts/`）。

## 6. Git 工作流
- 分支命名：`<type>/<short-description>`，type 例如 `feat`、`fix`、`chore`。
- Commit Message：遵循 Conventional Commits（如 `feat(backend): add diarization endpoint`）。
- PR 模板：描述背景、变更点、测试结果、待办事项。

## 7. 评审清单
1. 接口、数据模型是否有破坏性变更，若有需在 README/CHANGELOG 标注。
2. 是否存在硬编码路径/密钥，环境变量是否有默认值。
3. 是否增加了必要的日志与指标，便于线上排障。
4. 文档、示例是否同步更新。

---
落地这些规则时，若出现与现有实现冲突，请在 PR 中说明并优先保持向后兼容。
