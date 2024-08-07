import mailchimp from "@mailchimp/mailchimp_marketing";
import { RabbitMQQueueAdapter } from "../../serverMeasurements/queues-providers/RabbitQueueAdapter";
import type { ServicesNotificationData } from "../../utils/types";

const exchange = "notif_exchange";

async function startConsumer(serviceType: string) {
	const queueName = "service_queue_" + serviceType.toLowerCase();
	const rabbitSensorQueue = new RabbitMQQueueAdapter<ServicesNotificationData>(
		queueName,
		true,
		exchange,
	);
	console.log("Starting consumer " + queueName);
	rabbitSensorQueue.process(async (data: ServicesNotificationData) => {
		await sendEmailCampaign(
			data.emails,
			data.message.subject,
			data.message.content,
		);
	}, serviceType.toLowerCase());
}

mailchimp.setConfig({
	apiKey: "703dff1c72ae1e207db14e055c70e56b-us14", // Replace with your Mailchimp API key
	server: "us14", // Replace with your Mailchimp server prefix (e.g., us1, us2, etc.)
});

export async function sendEmailCampaign(
	recipients: string[],
	subject: string,
	content: string,
) {
	try {
		// Step 1: Create a campaign
		const campaignResponse = await mailchimp.campaigns.create({
			type: "regular",
			recipients: {
				list_id: "271f48a43b", // Replace with your Mailchimp list ID
				segment_opts: {
					// Optionally use segments to target specific recipients
					match: "any",
					conditions: recipients.map((email) => ({
						condition_type: "EmailAddress",
						field: "EMAIL",
						op: "is",
						value: email,
					})),
				},
			},
			settings: {
				subject_line: subject,
				reply_to: "andrewcooper2002@gmail.com", // Replace with your reply-to email address
				from_name: "Arquitectura", // Replace with your name or company name
			},
		});

		// Check if campaignResponse is of type Campaigns by checking for the id property
		if ("id" in campaignResponse) {
			// Step 2: Set content (HTML) for the campaign
			await mailchimp.campaigns.setContent(campaignResponse.id, {
				html: content,
			});

			// Step 3: Send the campaign
			const sendResponse = await mailchimp.campaigns.send(campaignResponse.id);
			console.log("Email campaign sent successfully:", sendResponse);
		} else {
			// Handle the error response
			console.error("Failed to create campaign:", campaignResponse);
		}
	} catch (error) {
		console.error("Failed to send email campaign:", error);
	}
}

export async function addEmailToList(emailAddress: string) {
	try {
		const response = await mailchimp.lists.addListMember("271f48a43b", {
			email_address: emailAddress,
			status: "subscribed",
		});
		console.log("Email added successfully:", response);
	} catch (error) {
		console.error("Failed to add email:", error);
	}
}

startConsumer("Booking").catch(console.error);
