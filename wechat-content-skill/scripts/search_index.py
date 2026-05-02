#!/usr/bin/env python3
"""
素材库索引管理脚本
功能：
1. 重建索引 (rebuild)
2. 搜索素材 (search)
3. 清理过期素材 (cleanup)
"""

import json
import os
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

# 素材库根目录
LIBRARY_ROOT = Path("content-library")
INDEX_FILE = LIBRARY_ROOT / "index.json"


def parse_frontmatter(content: str) -> dict:
    """解析 Markdown 文件的 YAML frontmatter"""
    frontmatter = {}
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            yaml_content = parts[1].strip()
            for line in yaml_content.split("\n"):
                if ":" in line:
                    key, value = line.split(":", 1)
                    key = key.strip()
                    value = value.strip()
                    # 处理列表格式
                    if value.startswith("[") and value.endswith("]"):
                        try:
                            value = json.loads(value.replace("'", '"'))
                        except json.JSONDecodeError:
                            pass
                    # 处理引号包裹的字符串
                    elif value.startswith('"') and value.endswith('"'):
                        value = value[1:-1]
                    frontmatter[key] = value
    return frontmatter


def rebuild_index() -> dict:
    """重建素材库索引"""
    index = {
        "version": "1.0",
        "updated": datetime.now().isoformat(),
        "topics_count": 0,
        "sources_count": 0,
        "topics": [],
        "sources": [],
        "keywords": {}
    }
    
    # 扫描选题目录
    topics_dir = LIBRARY_ROOT / "topics"
    if topics_dir.exists():
        for topic_file in topics_dir.rglob("*.md"):
            content = topic_file.read_text(encoding="utf-8")
            frontmatter = parse_frontmatter(content)
            if frontmatter.get("id"):
                topic_entry = {
                    "id": frontmatter.get("id"),
                    "title": frontmatter.get("title", ""),
                    "keywords": frontmatter.get("keywords", []),
                    "status": frontmatter.get("status", "draft"),
                    "priority": frontmatter.get("priority", "medium"),
                    "path": str(topic_file.relative_to(LIBRARY_ROOT))
                }
                index["topics"].append(topic_entry)
                
                # 更新关键词索引
                keywords = frontmatter.get("keywords", [])
                if isinstance(keywords, list):
                    for kw in keywords:
                        if kw not in index["keywords"]:
                            index["keywords"][kw] = []
                        index["keywords"][kw].append(frontmatter.get("id"))
    
    # 扫描素材源目录
    sources_dir = LIBRARY_ROOT / "sources"
    if sources_dir.exists():
        for source_file in sources_dir.rglob("*.md"):
            content = source_file.read_text(encoding="utf-8")
            frontmatter = parse_frontmatter(content)
            if frontmatter.get("id"):
                source_entry = {
                    "id": frontmatter.get("id"),
                    "title": frontmatter.get("title", ""),
                    "url": frontmatter.get("url", ""),
                    "topics": frontmatter.get("topics", []),
                    "path": str(source_file.relative_to(LIBRARY_ROOT))
                }
                index["sources"].append(source_entry)
    
    index["topics_count"] = len(index["topics"])
    index["sources_count"] = len(index["sources"])
    
    # 写入索引文件
    INDEX_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    
    print(f"索引重建完成：{index['topics_count']} 个选题，{index['sources_count']} 个素材源")
    return index


def search_materials(keyword: str) -> dict:
    """按关键词搜索素材"""
    if not INDEX_FILE.exists():
        print("索引文件不存在，请先运行 rebuild 命令")
        return {"topics": [], "sources": []}
    
    with open(INDEX_FILE, "r", encoding="utf-8") as f:
        index = json.load(f)
    
    results = {"topics": [], "sources": []}
    keyword_lower = keyword.lower()
    
    # 搜索选题
    for topic in index.get("topics", []):
        if (keyword_lower in topic.get("title", "").lower() or
            any(keyword_lower in kw.lower() for kw in topic.get("keywords", []))):
            results["topics"].append(topic)
    
    # 搜索素材源
    for source in index.get("sources", []):
        if keyword_lower in source.get("title", "").lower():
            results["sources"].append(source)
    
    print(f"找到 {len(results['topics'])} 个相关选题，{len(results['sources'])} 个相关素材源")
    return results


def cleanup_archived(dry_run: bool = True) -> list:
    """清理已归档的过期素材"""
    if not INDEX_FILE.exists():
        print("索引文件不存在，请先运行 rebuild 命令")
        return []
    
    with open(INDEX_FILE, "r", encoding="utf-8") as f:
        index = json.load(f)
    
    archived = []
    for topic in index.get("topics", []):
        if topic.get("status") == "archived":
            archived.append(topic)
    
    if dry_run:
        print(f"[预览模式] 发现 {len(archived)} 个已归档选题：")
        for t in archived:
            print(f"  - {t['id']}: {t['title']}")
        print("使用 --execute 参数实际删除这些文件")
    else:
        for t in archived:
            file_path = LIBRARY_ROOT / t["path"]
            if file_path.exists():
                file_path.unlink()
                print(f"已删除：{t['path']}")
        # 重建索引
        rebuild_index()
    
    return archived


def main():
    import sys
    
    if len(sys.argv) < 2:
        print("用法：")
        print("  python search_index.py rebuild          # 重建索引")
        print("  python search_index.py search <关键词>  # 搜索素材")
        print("  python search_index.py cleanup          # 预览可清理的归档素材")
        print("  python search_index.py cleanup --execute # 实际删除归档素材")
        return
    
    command = sys.argv[1]
    
    if command == "rebuild":
        rebuild_index()
    elif command == "search":
        if len(sys.argv) < 3:
            print("请提供搜索关键词")
            return
        results = search_materials(sys.argv[2])
        if results["topics"]:
            print("\n相关选题：")
            for t in results["topics"]:
                print(f"  [{t['priority']}] {t['id']}: {t['title']}")
        if results["sources"]:
            print("\n相关素材源：")
            for s in results["sources"]:
                print(f"  {s['id']}: {s['title']}")
    elif command == "cleanup":
        execute = len(sys.argv) > 2 and sys.argv[2] == "--execute"
        cleanup_archived(dry_run=not execute)
    else:
        print(f"未知命令：{command}")


if __name__ == "__main__":
    main()
