import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useState } from "react";

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
  // Sample data - replace with your actual data
  const sampleItems = [
    {
      title: "AAAI",
      description: "AAAI Conference on Artificial Intelligence",
      sub: "AI",
      rank: {
        ccf: "A",
        core: "A*",
        thcpl: "A",
      },
      dblp: "aaai",
      confs: [
        {
          year: 2025,
          id: "aaai25",
          link: "https://aaai.org/conference/aaai/aaai-25/",
          timeline: [
            {
              abstract_deadline: "2024-08-07 23:59:59",
              deadline: "2024-08-15 23:59:59",
            },
          ],
          timezone: "UTC-12",
          date: "February 25 - March 4, 2025",
          place: "PHILADELPHIA, PENNSYLVANIA, USA",
        },
      ],
    },
  ];

  const [isShowingDetail, setIsShowingDetail] = useState(true);

  return (
    <List isShowingDetail={isShowingDetail} searchBarPlaceholder="Search conferences...">
      {sampleItems.map((item) => renderListItem(item, isShowingDetail, setIsShowingDetail))}
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
