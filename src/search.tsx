import { Action, ActionPanel, Icon, List } from "@raycast/api";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";
import { useEffect, useState } from "react";

interface Timeline {
  abstract_deadline: string;
  deadline: string;
}

interface Conference {
  year: number;
  id: string;
  link: string;
  timeline: Timeline[];
  timezone: string;
  date: string;
  place: string;
}

interface Item {
  title: string;
  description: string;
  sub: string;
  rank: {
    ccf: string;
    core: string;
    thcpl: string;
  };
  dblp: string;
  confs: Conference[];
}

export default function Command() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isShowingDetail, setIsShowingDetail] = useState(true);

  useEffect(() => {
    async function loadConferenceData() {
      try {
        // Adjust the path to where your YAML files are stored
        const conferenceDir = "/Users/wei/source/raycast/extensions/extensions/ccfddl/example/conference";
        console.log("Loading conference data from", conferenceDir);

        const categories = await fs.promises.readdir(conferenceDir);
        const allItems: Item[] = [];

        for (const category of categories) {
          const categoryPath = path.join(conferenceDir, category);
          const isDirectory = (await fs.promises.stat(categoryPath)).isDirectory();

          if (isDirectory) {
            const files = await fs.promises.readdir(categoryPath);

            for (const file of files) {
              if (file.endsWith(".yml")) {
                const filePath = path.join(categoryPath, file);
                const fileContent = await fs.promises.readFile(filePath, "utf8");
                const yamlContent = yaml.load(fileContent) as Item[];
                allItems.push(...yamlContent);
              }
            }
          }
        }

        setItems(allItems);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load conference data:", error);
        setLoading(false);
      }
    }

    loadConferenceData();
  }, []);

  return (
    <List isLoading={loading} isShowingDetail={isShowingDetail} searchBarPlaceholder="Search conferences...">
      {items.map((item) => renderListItem(item, isShowingDetail, setIsShowingDetail))}
    </List>
  );
}

function renderListItem(item: Item, isShowingDetail: boolean, setIsShowingDetail: (showing: boolean) => void) {
  return (
    <List.Item
      key={item.title}
      icon={Icon.Calendar}
      title={item.title}
      subtitle={item.sub}
      accessories={[{ text: `Rank: ${item.rank.ccf}` }, { text: item.confs[0]?.place }]}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title="Open Conference Website" url={item.confs[0]?.link} />
          <Action
            title="Toggle Detail View"
            icon={Icon.Eye}
            shortcut={{ modifiers: ["cmd"], key: "d" }}
            onAction={() => setIsShowingDetail(!isShowingDetail)}
          />
          <Action.CopyToClipboard
            title="Copy Conference Info"
            content={`${item.title}: ${item.description}`}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
        </ActionPanel>
      }
      detail={
        <List.Item.Detail
          markdown={`# ${item.title}\n\n${item.description}\n\n## Next Conference\n* **Date:** ${item.confs[0]?.date}\n* **Location:** ${item.confs[0]?.place}\n* **Deadline:** ${item.confs[0]?.timeline[0].deadline}\n* **Website:** [${item.confs[0]?.link}](${item.confs[0]?.link})`}
          metadata={
            <List.Item.Detail.Metadata>
              <List.Item.Detail.Metadata.Label title="Conference" text={item.title} />
              <List.Item.Detail.Metadata.Label title="Description" text={item.description} />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Category" text={item.sub} />
              <List.Item.Detail.Metadata.Label title="CCF Rank" text={item.rank.ccf} />
              <List.Item.Detail.Metadata.Label title="CORE Rank" text={item.rank.core} />
              <List.Item.Detail.Metadata.Label title="THCPL Rank" text={item.rank.thcpl} />
              <List.Item.Detail.Metadata.Separator />
              <List.Item.Detail.Metadata.Label title="Next Deadline" text={item.confs[0]?.timeline[0].deadline} />
              <List.Item.Detail.Metadata.Label title="Timezone" text={item.confs[0]?.timezone} />
            </List.Item.Detail.Metadata>
          }
        />
      }
    />
  );
}
