"use client";

import { SiGithub } from "@icons-pack/react-simple-icons";
import kitchn, {
	Container,
	Icon,
	Link as KitchnLink,
	Text,
	Tooltip,
} from "kitchn";

const Footer: React.FC = () => (
	<Container>
		<Text>
			made with ❤️ by{" "}
			<Tooltip text="le goat du dév">
				<Link href={"https://github.com/jerembdn"} variant="secondary">
					vrai jijon
				</Link>
			</Tooltip>{" "}
			using{" "}
			<Tooltip text="le meilleur ui-kit">
				<Link href={"https://kitchn.tonightpass.com"} variant="secondary">
					kitchn
				</Link>
			</Tooltip>{" "}
			—{" "}
			<Link href={"https://kitchn.tonightpass.com"} variant="secondary">
				<Icon icon={SiGithub} size={12} />
				source code
			</Link>
		</Text>
	</Container>
);

const Link = kitchn(KitchnLink)`
  align-items: center;
  gap: 2px;
`;

export default Footer;
